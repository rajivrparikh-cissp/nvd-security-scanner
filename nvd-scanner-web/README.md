# NVD Security Scanner

A free, production-grade web application that scans any website's technology stack against the [NIST National Vulnerability Database (NVD)](https://nvd.nist.gov/) to identify CVEs and calculate a security grade.

🌐 **Live:** https://nvd-scanner-web-135378541186.australia-southeast1.run.app

---

## Features

- 🔍 **URL Scanner** — Detects web server, CMS, and framework technologies via HTTP headers
- 🛡️ **CVE Cross-Reference** — Queries NVD API for known vulnerabilities per detected technology
- 📊 **Security Grade** — Assigns A–F grade based on CVE severity scores
- 🔥 **Live Trending Feed** — Displays latest high-severity CVEs from NVD in real time
- 📢 **Google AdSense** — Monetised with responsive ad units

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (React 19, TypeScript) |
| Styling | Tailwind CSS v4 |
| Backend | Next.js API Routes |
| CVE Data | NIST NVD REST API v2 |
| Hosting | Google Cloud Run (australia-southeast1) |
| CI/CD | GitHub → Cloud Build → Cloud Run |
| Container | Docker (node:20-alpine, multi-stage) |

---

## Local Development

```bash
cd nvd-scanner-web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment

Every push to `main` automatically triggers a Cloud Build → Cloud Run deploy via the connected repository trigger.

To manually build and deploy:

```bash
# Build and push image
gcloud builds submit --tag gcr.io/passiveincome01/nvd-scanner-web:latest --project passiveincome01

# Deploy to Cloud Run
gcloud run deploy nvd-scanner-web \
  --image gcr.io/passiveincome01/nvd-scanner-web:latest \
  --platform managed \
  --region australia-southeast1 \
  --allow-unauthenticated \
  --project passiveincome01
```

---

## Project Structure

```
nvd-scanner-web/
├── src/app/
│   ├── page.tsx          # Main scanner UI + AdSense units
│   ├── layout.tsx        # Root layout + AdSense script tags
│   ├── globals.css       # Global styles
│   └── api/
│       ├── scan/         # POST /api/scan — tech detection + CVE lookup
│       └── trending/     # GET /api/trending — latest NVD CVEs
├── Dockerfile            # Multi-stage production build
├── cloudbuild.yaml       # CI/CD pipeline config
└── next.config.ts        # Security headers + CSP
```

---

Built by [Rajiv Parikh](https://github.com/rajivrparikh-cissp) — 25+ years in enterprise IT security.
