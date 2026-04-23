'use client';

import { useState } from 'react';

type Vulnerability = {
  id: string;
  description: string;
  score: number;
};

type ScanResult = {
  score: string;
  techStack: string[];
  vulnerabilities: Vulnerability[];
};

export default function Home() {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    setIsScanning(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to scan website');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <main>
      <div className="hero">
        <h1 className="title">Free NVD Vulnerability Scanner: Check Website CVEs Instantly</h1>
        <p className="subtitle">
          Instantly evaluate a website's technology stack against the National Vulnerability Database (NVD) 
          to discover exposed CVEs and calculate a security grade.
        </p>
      </div>

      <div className="glass-panel">
        <form onSubmit={handleScan} className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder="Enter website URL (e.g. example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isScanning}
          />
          <button type="submit" className="btn-primary" disabled={isScanning || !url}>
            {isScanning ? 'Scanning...' : 'Scan Now'}
          </button>
        </form>

        <div className="seo-description" style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--text-bright)' }}>Why Use NVDScanner?</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>
            Our free scanner identifies the underlying technology stack of any domain—including web servers (Apache, Nginx) and CMS (WordPress, Drupal)—and cross-references them with the latest CVE entries in the NIST National Vulnerability Database. Protect your infrastructure against zero-day vulnerabilities and OWASP Top 10 threats by generating instant CVSS scores and security grades for your web applications.
          </p>
        </div>

        {error && (
          <div className="error-msg">
            ⚠️ {error}
          </div>
        )}

        {isScanning && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Analyzing headers & cross-referencing NVD database...</p>
          </div>
        )}

        {result && !isScanning && (
          <div className="results-grid">
            <div className="score-card">
              <h3>Security Grade</h3>
              <div className={`score-circle score-${result.score}`}>
                {result.score}
              </div>
              <p style={{ color: 'var(--text-muted)' }}>
                Based on highest CVSS score of detected technologies.
              </p>
            </div>

            <div className="details-card">
              <h3>Detected Technologies</h3>
              <div className="tech-list">
                {result.techStack.length > 0 ? (
                  result.techStack.map((tech, i) => (
                    <span key={i} className="tech-tag">{tech}</span>
                  ))
                ) : (
                  <span className="tech-tag" style={{ opacity: 0.5 }}>None Detected</span>
                )}
              </div>

              <h3>Top Vulnerabilities (CVEs)</h3>
              {result.vulnerabilities.length > 0 ? (
                <div>
                  {result.vulnerabilities.map((vuln) => (
                    <div key={vuln.id} className="vuln-item">
                      <div className="vuln-header">
                        <a 
                          href={`https://nvd.nist.gov/vuln/detail/${vuln.id}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="vuln-id"
                        >
                          {vuln.id} 🔗
                        </a>
                        <span className="vuln-score">CVSS: {vuln.score}</span>
                      </div>
                      <p className="vuln-desc" title={vuln.description}>{vuln.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--success)' }}>
                  ✅ No known vulnerabilities found for the detected stack.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Trending CVEs / Live Feed Section */}
      <div className="trending-section" style={{ marginTop: '4rem', maxWidth: '900px', width: '100%', marginInline: 'auto' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-bright)', textAlign: 'center' }}>🔥 Trending Vulnerabilities (Live Feed)</h2>
        <div className="glass-panel" style={{ padding: '1.5rem', maxWidth: '100%' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li style={{ paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <a href="https://nvd.nist.gov/vuln/detail/CVE-2023-38545" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>CVE-2023-38545</a>
              <span style={{ marginLeft: '10px', color: '#ff4444', fontSize: '0.85rem', fontWeight: 'bold' }}>CVSS: 9.8 (CRITICAL)</span>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Severity heap-based buffer overflow in curl and libcurl. Upgrade immediately.</p>
            </li>
            <li style={{ paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <a href="https://nvd.nist.gov/vuln/detail/CVE-2023-44487" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>CVE-2023-44487</a>
              <span style={{ marginLeft: '10px', color: '#ff4444', fontSize: '0.85rem', fontWeight: 'bold' }}>CVSS: 7.5 (HIGH)</span>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>HTTP/2 Rapid Reset Attack causing widespread Denial of Service (DDoS) across major web servers.</p>
            </li>
            <li>
              <a href="https://nvd.nist.gov/vuln/detail/CVE-2024-3094" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>CVE-2024-3094</a>
              <span style={{ marginLeft: '10px', color: '#ff4444', fontSize: '0.85rem', fontWeight: 'bold' }}>CVSS: 10.0 (CRITICAL)</span>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Malicious code discovered in the upstream xz/liblzma packages. Severe supply chain attack.</p>
            </li>
          </ul>
        </div>
      </div>

      {/* Trust Footer */}
      <footer style={{ marginTop: '5rem', padding: '2rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', width: '100%', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          <strong>Privacy Disclaimer:</strong> We value your privacy. We do not store, log, or track the URLs you scan. All analysis is performed instantly and discarded.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Built by <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Rajiv Parikh</a> — 25+ years of experience in enterprise IT security and software architecture.
        </p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'underline' }}>Terms of Service</a>
          <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'underline' }}>API Documentation</a>
        </div>
      </footer>
    </main>
  );
}
