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
        <h1 className="title">NVD Security Scanner</h1>
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
    </main>
  );
}
