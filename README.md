# CloudSecure v2.0 

**Enterprise-grade multi-cloud security scanner with SaaS dashboard, posture telemetry, and drift detection**

[![CI/CD](https://github.com/DevAnnafi/CloudSecure/actions/workflows/ci.yml/badge.svg)](https://github.com/DevAnnafi/CloudSecure/actions)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

CloudSecure is a comprehensive security scanning platform that identifies misconfigurations and vulnerabilities across AWS, Azure, and Google Cloud Platform. Built for security teams, DevOps engineers, and compliance auditors.

**NEW in v2.0:** Real-time SaaS dashboard with API-driven scans, security posture scoring, and findings management.

---

## Features

### SaaS Dashboard (NEW - v2.0)
- **Interactive Web Dashboard**: Next.js + React + TypeScript
- **Real-Time Scanning**: Trigger scans via web UI
- **Security Posture Visualization**: 0-100 credit score with color-coded metrics
- **Findings Management**: View, filter, and search vulnerabilities
- **Multi-Account Support**: Manage multiple cloud accounts from one dashboard
- **REST API**: FastAPI backend with auto-generated Swagger docs

### Multi-Cloud Coverage
- **AWS**: S3 buckets, IAM privilege escalation (18 vectors), EC2 metadata (IMDSv1)
- **Azure**: Storage containers, RBAC roles, VM metadata
- **GCP**: Cloud Storage buckets, IAM bindings, Compute metadata

### Multi-Account Scanning
- Scan multiple AWS accounts, Azure subscriptions, and GCP projects simultaneously
- Environment-based configuration (production, staging, development)
- Consolidated reporting across all cloud accounts

### Security Posture Telemetry
- **Risk Scoring**: 0-100 security health score
- **Per-Cloud Breakdown**: Individual scores for AWS, Azure, GCP
- **Trend Analysis**: Track security improvements over time
- **Compliance Metrics**: Monitor critical, high, medium, low findings

### Drift Detection
- Compare current scan against baseline
- Identify new vulnerabilities discovered
- Track resolved security issues
- Monitor security posture trends (improved/worse/unchanged)

### 30+ Security Checks
**Critical Findings:**
- Public cloud storage (S3, Azure Blob, GCS)
- IAM privilege escalation paths
- SSRF vulnerabilities (IMDSv1 enabled)
- Wildcard permissions

**High-Risk Findings:**
- Missing encryption at rest
- Overly permissive roles (Contributor, Editor)
- Public authenticated access

---

## Tech Stack

### Backend
- **Language**: Python 3.8+
- **API Framework**: FastAPI
- **Database**: SQLAlchemy + SQLite (PostgreSQL for production)
- **Background Tasks**: FastAPI BackgroundTasks
- **Cloud SDKs**: boto3 (AWS), Azure SDK, Google Cloud SDK

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: Next.js file-based routing

### DevOps
- **Testing**: pytest (40% coverage, 23 passing tests)
- **CI/CD**: GitHub Actions
- **CLI**: Rich (terminal UI)

---

## Installation

### Prerequisites
- Python 3.8+
- Node.js 18+ (for dashboard)
- AWS CLI (for AWS scanning)
- Azure CLI (for Azure scanning)
- Google Cloud SDK (for GCP scanning)

### Clone Repository
```bash
git clone https://github.com/DevAnnafi/CloudSecure.git
cd CloudSecure
```

### Backend Setup
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy pydantic-settings python-dotenv
pip install -r requirements.txt
```

### Frontend Setup
```bash
cd frontend
npm install
cd ..
```

---

## Quick Start

### Option 1: SaaS Dashboard (Recommended)

**Start Backend API:**
```bash
source venv/bin/activate
uvicorn api.main:app --reload
```
Backend runs at: http://localhost:8000

**Start Frontend Dashboard:**
```bash
cd frontend
npm run dev
```
Dashboard runs at: http://localhost:3000

**Access:**
- Dashboard: http://localhost:3000
- API Docs: http://localhost:8000/docs

**Create Your First Scan:**
1. Click "+ New Scan" button
2. Scan runs automatically (AWS default profile)
3. View results: security score, findings breakdown
4. Click on scan to see detailed findings

---

### Option 2: CLI Tool (Original)

**Single Account Scan:**
```bash
python src/cli.py scan --aws --output aws-report.json --verbose
```

**Multi-Cloud Scan:**
```bash
python src/cli.py scan --all --output multi-cloud-report.json --verbose
```

---

## Dashboard Features

### Home Page
- **Scan List Table**: All scans with status, score, findings
- **Color-Coded Scores**: Green (80+), Yellow (60-79), Red (<60)
- **Create Scan Button**: Trigger new scans instantly
- **Clickable Rows**: Navigate to scan details

### Scan Details Page
- **Big Security Score**: Large 0-100 display with color coding
- **Status Badge**: Completed, Running, Failed
- **Timestamps**: Started and completed times
- **Total Findings**: Count of security issues
- **Severity Breakdown**: Critical, High, Medium, Low counts
- **Findings Table**: Full list of vulnerabilities
  - Severity badges (color-coded)
  - Title, Resource, Description
  - Empty state for clean accounts

### API Endpoints

**Scans:**
- `POST /scans` - Create new scan (triggers background task)
- `GET /scans` - List all scans (paginated)
- `GET /scans/{id}` - Get scan details
- `DELETE /scans/{id}` - Delete scan

**Findings:**
- `GET /findings/{scan_id}` - Get all findings for a scan

**Health:**
- `GET /health` - API health check

**Documentation:**
- `GET /docs` - Swagger UI (interactive API docs)

---

## Database Schema

### Tables
- **accounts**: Cloud accounts (AWS/Azure/GCP)
- **scans**: Scan records with scores and metadata
- **findings**: Individual security vulnerabilities

### Relationships
```
Account (1) → Scans (many)
Scan (1) → Findings (many)
```

---

## Multi-Account Scanning (CLI)

### Step 1: Create Configuration

Create `config/environments.yml`:
```yaml
production:
  aws:
    - profile: prod-main
      name: "Production Main Account"
    - profile: prod-dr
      name: "Production DR Account"
  azure:
    - subscription_id: "12345678-1234-1234-1234-123456789012"
      name: "Production Subscription"
  gcp:
    - project_id: "my-prod-project-123"
      name: "Production GCP Project"
```

### Step 2: Run Multi-Account Scan
```bash
python src/cli.py scan \
  --environment production \
  --config config/environments.yml \
  --output production-report.json \
  --verbose
```

---

## Current Status

### Completed
- **CLI Scanner**: 100% functional (v2.0 with multi-account)
- **Backend API**: 100% functional
  - FastAPI with SQLAlchemy
  - Background task processing
  - REST endpoints for scans/findings
  - Auto-generated API docs
- **Dashboard**: 30% complete (Days 1-3 done)
  - Home page with scan list
  - Scan details page
  - Findings table
  - Create scan button

### In Progress (Dashboard - Week 4-5)
- Day 4: Advanced create scan form
- Day 5: Dashboard overview/home
- Day 6: Remediation backend
- Day 7: Multi-cloud support (Azure/GCP in UI)
- Day 8: Charts & visualizations
- Day 9: Settings & polish
- Day 10: Testing

### Upcoming (Week 6-7)
- User authentication (JWT)
- Multi-tenancy (user-specific data)
- Landing page with pricing
- Deployment to production
- PostgreSQL migration
- Custom domain

---

## Roadmap

### Phase 1: Dashboard MVP (Week 4-5) - In Progress
- ✅ Scan list view
- ✅ Scan details page
- ✅ Findings table
- ✅ Create scan form
- ✅ Dashboard home
- ✅ Remediation suggestions
- ✅ Charts & visualizations

### Phase 2: Authentication & Launch (Week 6)
- ✅ User registration/login
- ✅ JWT authentication
- ✅ User-specific scans
- ✅ Landing page
- ✅ Pricing tiers (Free/Pro/Enterprise)

### Phase 3: Deployment (Week 7)
- Backend: Railway/Render
- Frontend: Vercel
- Database: PostgreSQL
- Domain: cloudsecure.io
- Go live!

### Phase 4: Growth (Month 2+)
- Beta user onboarding
- Email notifications
- Slack integration
- PDF reports
- Scheduled scans
- API keys for integrations

### Phase 5: Revenue (Month 3+)
- Stripe integration
- Paid plans ($99-499/mo)
- First paying customers
- Marketing & SEO

### Phase 6: Scale (Month 4-6)
- Auto-remediation (Terraform)
- Compliance frameworks (CIS, SOC 2)
- Team accounts
- RBAC
- $10k MRR target

---

## Security Checks

### AWS (9 checks)
- **S3 Buckets**
  - Public access via ACL (CRITICAL)
  - Public access via bucket policy (CRITICAL)
  - Block Public Access disabled (CRITICAL)
  - Encryption disabled (HIGH)

- **IAM Privilege Escalation** (18 vectors)
  - Wildcard permissions, CreateAccessKey, AttachUserPolicy, etc.

- **EC2 Metadata**
  - IMDSv1 enabled (CRITICAL)

### Azure (3 checks)
- Public storage containers (CRITICAL)
- Contributor/Owner roles (CRITICAL/HIGH)
- VM metadata access (CRITICAL)

### GCP (3 checks)
- Public buckets (CRITICAL/HIGH)
- Owner/Editor roles (CRITICAL/HIGH)
- Compute metadata access (CRITICAL)

---

## Testing

Run automated tests:
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src tests/

# Current: 40% coverage, 23 passing tests
```

---

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with [boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html) for AWS
- Uses [Azure SDK for Python](https://github.com/Azure/azure-sdk-for-python)
- Powered by [Google Cloud Python Client](https://github.com/googleapis/google-cloud-python)
- CLI powered by [Rich](https://github.com/Textualize/rich)
- Dashboard built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/)
- API powered by [FastAPI](https://fastapi.tiangolo.com/)

---

## Contact

Email: islamannafi@gmail.com

Project Link: [https://github.com/DevAnnafi/CloudSecure](https://github.com/DevAnnafi/CloudSecure)

---

<p align="center">
  Made by DevAnnafi for Cloud Security
</p>