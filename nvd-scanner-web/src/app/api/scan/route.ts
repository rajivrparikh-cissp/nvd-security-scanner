import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

const NVD_API_KEY = process.env.NVD_API_KEY;

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || !url.startsWith('http')) {
      return NextResponse.json({ error: 'Valid URL is required (must start with http/https)' }, { status: 400 });
    }

    // 1. Fetch URL and extract tech stack
    const targetResponse = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) NVD Scanner Bot'
      }
    }).catch(e => {
      throw new Error(`Failed to fetch URL: ${e.message}`);
    });

    const html = targetResponse.data;
    const headers = targetResponse.headers;
    const $ = cheerio.load(html);

    const techStack: string[] = [];

    // Check headers
    if (headers['server']) techStack.push(headers['server'].toString().split('/')[0]);
    if (headers['x-powered-by']) techStack.push(headers['x-powered-by'].toString());

    // Check meta generator
    const generator = $('meta[name="generator"]').attr('content');
    if (generator) techStack.push(generator);

    // Basic heuristic checks for common frameworks
    if ($('[data-reactroot], #__next, script[src*="_next"]').length > 0) techStack.push('Next.js', 'React');
    if ($('script[src*="wp-content"], link[href*="wp-content"]').length > 0) techStack.push('WordPress');

    // Clean up stack (deduplicate and filter out empty)
    const uniqueTech = [...new Set(techStack.filter(Boolean))];

    if (uniqueTech.length === 0) {
      return NextResponse.json({
        score: 'A',
        techStack: ['Unknown/Hidden'],
        vulnerabilities: [],
        message: 'No technologies were exposed to scan.'
      });
    }

    // 2. Query NVD for each technology
    const allVulns: { id: string, description: string, score: number }[] = [];
    const nvdHeaders: Record<string, string> = {};
    if (NVD_API_KEY && NVD_API_KEY !== "your_api_key_here") {
      nvdHeaders["apiKey"] = NVD_API_KEY;
    }

    // To prevent rate limiting, we only query the first 3 detected technologies for this demo
    for (const tech of uniqueTech.slice(0, 3)) {
      try {
        const keyword = encodeURIComponent(tech);
        const nvdRes = await axios.get(`https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${keyword}&resultsPerPage=5`, {
          headers: nvdHeaders,
          timeout: 10000
        });

        const cves = nvdRes.data.vulnerabilities || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cves.forEach((v: { cve: any }) => {
          const cve = v.cve;
          // Extract CVSS V3 score if available, otherwise V2
          let cvssScore = 0;
          if (cve.metrics?.cvssMetricV31?.[0]) cvssScore = cve.metrics.cvssMetricV31[0].cvssData.baseScore;
          else if (cve.metrics?.cvssMetricV30?.[0]) cvssScore = cve.metrics.cvssMetricV30[0].cvssData.baseScore;
          else if (cve.metrics?.cvssMetricV2?.[0]) cvssScore = cve.metrics.cvssMetricV2[0].cvssData.baseScore;

          if (cvssScore > 0) {
            allVulns.push({
              id: cve.id,
              description: cve.descriptions?.[0]?.value || 'No description',
              score: cvssScore
            });
          }
        });
      } catch (err) {
        console.error(`Failed to fetch CVEs for ${tech}:`, err instanceof Error ? err.message : String(err));
        // Continue scanning other techs even if one fails (NVD rate limits are strict)
      }
    }

    // 3. Deduplicate and sort vulnerabilities by score (highest first)
    const uniqueVulnsMap = new Map();
    allVulns.forEach(v => {
      if (!uniqueVulnsMap.has(v.id) || uniqueVulnsMap.get(v.id).score < v.score) {
        uniqueVulnsMap.set(v.id, v);
      }
    });
    
    const sortedVulns = Array.from(uniqueVulnsMap.values()).sort((a, b) => b.score - a.score).slice(0, 5);

    // 4. Calculate Final Security Grade
    let grade = 'A';
    if (sortedVulns.length > 0) {
      const highestScore = sortedVulns[0].score;
      if (highestScore >= 9.0) grade = 'F';
      else if (highestScore >= 7.0) grade = 'D';
      else if (highestScore >= 4.0) grade = 'C';
      else grade = 'B';
    }

    return NextResponse.json({
      score: grade,
      techStack: uniqueTech,
      vulnerabilities: sortedVulns
    });

  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred during the scan' }, { status: 500 });
  }
}
