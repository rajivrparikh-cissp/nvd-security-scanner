import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: 'X-UA-Compatible',
    value: 'IE=edge',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://pagead2.googlesyndication.com https://cdn.ampproject.org https://adservice.google.com https://www.googletagservices.com https://googleads.g.doubleclick.net",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
      "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com",
      "connect-src 'self' https://services.nvd.nist.gov https://pagead2.googlesyndication.com https://adservice.google.com",
      "font-src 'self' data:",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
export default nextConfig;
