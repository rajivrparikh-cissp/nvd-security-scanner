import { NextResponse } from 'next/server';
import axios from 'axios';

const NVD_API_KEY = process.env.NVD_API_KEY;

export async function GET() {
  try {
    const nvdHeaders: Record<string, string> = {};
    if (NVD_API_KEY && NVD_API_KEY !== "your_api_key_here") {
      nvdHeaders["apiKey"] = NVD_API_KEY;
    }

    const response = await axios.get(
      'https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=5',
      {
        headers: nvdHeaders,
        timeout: 10000,
      }
    );

    const data = response.data;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatted = data.vulnerabilities.map((v: { cve: any }) => {
      const cveData = v.cve;
      // Extracting CVSS v3.1 info if available, otherwise v3.0 or N/A
      const metrics =
        cveData.metrics?.cvssMetricV31?.[0]?.cvssData ||
        cveData.metrics?.cvssMetricV30?.[0]?.cvssData;

      return {
        id: cveData.id,
        score: metrics?.baseScore?.toFixed(1) || 'N/A',
        severity: metrics?.baseSeverity || 'UNKNOWN',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description: cveData.descriptions.find((d: { lang: string, value: string }) => d.lang === 'en')?.value || 'No description available.',
      };
    });

    return NextResponse.json({ vulnerabilities: formatted });
  } catch (error) {
    console.error('Failed to fetch trending CVEs:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch trending CVEs' },
      { status: 500 }
    );
  }
}
