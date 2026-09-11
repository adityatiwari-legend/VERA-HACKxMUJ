# VERA — Verifiable Evidence & Real Auditing

> **"A donor should be able to trace where their donated money goes, why it was released, what proof was submitted, and what happened to the funds afterward."**

**VERA** is a transparent donation and fund-tracking platform built for high-trust philanthropy. Fund movement is tracked end-to-end:

```text
DONOR
  ↓
DONATION
  ↓
EARMARKED CAMPAIGN
  ↓
LOCKED ESCROW
  ↓
MILESTONE
  ↓
PROOF SUBMITTED
  ↓
AI VERIFICATION
  ↓
HUMAN AUDITOR
  ↓
2-OF-3 MULTISIG APPROVAL
  ↓
BLOCKCHAIN RELEASE
  ↓
BENEFICIARY SPEND
  ↓
PUBLIC AUDIT TRAIL
```

---

## 1. Five Completed Phases of VERA

VERA has been developed in **five deliberate, production-structured phases**:

- **Phase 1: Application Foundation & Campaigns**: Next.js App Router, PostgreSQL via raw parameterized `pg`, pure SQL migrations, JWT cookie authentication, Multi-Tenant RBAC (Donor, NGO, Auditor, Admin), NGO Campaign Management, and immutable audit logs.
- **Phase 2: Donation & Fund Lifecycle**: Simulated donor contributions, campaign earmarking, PostgreSQL escrow locking state machine, milestone budget allocation caps, atomic double-entry fund transactions (`DONATION`, `LOCK`, `RELEASE`, `REFUND`), and overfunding concurrency protection.
- **Phase 3: Proof & Verification Engine**: Cryptographic evidence storage with SHA-256 fingerprinting, path traversal protection, MIME validation, AI/OCR line-item discrepancy screening, certified human auditor discretionary review, and historical proof preservation.
- **Phase 4: Blockchain & Advanced Fund Controls**: Solidity smart contract (`VERA.sol`) on testnet, ethers.js integration, 2-of-3 multi-signature release authorization, double-release prevention, and on-chain refund workflows.
- **Phase 5: Final Productization & Public Audit**: Public Audit Dashboard (`/campaigns/:id/audit`), Complete Chronological Fund Timeline, "Trace My Donation" journey (`/donor/donations/:id/trace`), Printable Campaign Reports (`/campaigns/:id/report`), Deterministic NGO Reputation Index (0–100) and Public NGO Profiles (`/ngos/:id`), Campaign Trust Indicators, Nginx reverse proxy with HTTPS/TLS configuration, and Docker Compose deployment.

---

## 2. Key Product Features

### 1. Public Audit Dashboard (`/campaigns/:id/audit`)
- Open to anyone without authentication.
- Real-time financial summary: Target, Raised, Locked in Escrow, Released to Beneficiaries, Refunded, Remaining Goal, and Progress %.
- Visual analytics: Funding distribution bar showing escrow ratios.
- Milestone registry: Sequence, title, allocation, released sum, proof status, AI verification discrepancy indicator, auditor approval status, and multisig threshold state.
- Beneficiary spend evidence disclosure.
- Blockchain verification section: Network, verified smart contract address, and confirmed transaction hashes with direct block explorer links (`getExplorerTxUrl`).
- Complete chronological audit timeline merging database events, audit logs, and on-chain transactions.

### 2. "Trace My Donation" Journey (`/donor/donations/:id/trace`)
- Answers the core donor question: *"Where did my money go?"*
- Step-by-step visual path:
  1. Donation Received & Confirmed
  2. Earmarked to Campaign Escrow
  3. Assigned to Milestone Allocation
  4. Evidence Proof Submitted
  5. AI Verification & Auditor Review
  6. 2-of-3 Multi-Signature Consensus
  7. On-Chain Smart Contract Release
- Honest accounting disclosure clarifying pooled campaign escrow vs physical currency tracking.

### 3. Deterministic NGO Reputation Score (`/ngos/:id`)
- 100% deterministic, transparent formula (0–100 scale, base 100).
- Transparent factors:
  - **Base Index:** 100 points
  - **Penalties:** -15 per failed milestone, -10 per rejected proof, -5 per AI discrepancy flag, -10 per refund issued.
  - **Bonuses:** +10 per completed milestone (up to +30 max), +5 for 100% proof approval rate, +5 for clean high fund utilization (≥70%).
  - **Grades:** A+ (Exemplary), A (High Integrity), B (Reliable), C (Moderate), D (High Risk).
- Public profile excludes private email, passwords, phone numbers, and internal audit notes.

### 4. Printable Campaign Reports (`/campaigns/:id/report`)
- Clean, high-contrast, document-style view with `@media print` CSS.
- Includes executive summary, complete financial ledger, milestone delivery registry, smart contract anchors, and compliance attestation.

---

## 3. Technology Stack

- **Frontend & App Framework**: Next.js 14 (App Router, Server & Client Components)
- **Styling**: Tailwind CSS & Lucide Icons
- **Backend & Database**: PostgreSQL 16 via native parameterized `pg` (Zero ORM overhead)
- **Authentication**: Stateless HTTP-only JWT cookies via `jose` and `bcryptjs`
- **Smart Contracts**: Solidity 0.8.28, Hardhat, Ethers.js v6
- **Evidence Storage**: Cryptographic SHA-256 fingerprinting with sanitized volume storage
- **AI Verification**: Google Gemini API & Vision OCR with rule-based discrepancy validation
- **Production Server**: Nginx reverse proxy with TLS/Let's Encrypt support, Docker Compose

---

## 4. Local Quickstart

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### 1. Clone & Install
```bash
git clone https://github.com/your-org/vera.git
cd vera
npm install
```

### 2. Start PostgreSQL Database
```bash
docker compose up -d vera-db
```

### 3. Run Migrations & Seed Demo Data
```bash
npm run db:migrate
npm run db:seed
```

### 4. Start Local Hardhat Blockchain Node (Optional for on-chain tests)
```bash
npx hardhat node
# In another terminal, deploy contract:
npm run deploy:contract
```

### 5. Launch Next.js Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 5. Demo Accounts & Credentials

For hackathon presentation and local testing (Password: `Password123!`):

| Role | Email | Purpose |
|---|---|---|
| **NGO Admin** | `ngo@fundtrail.org` / `ngo@vera.org` | Create campaigns, upload proof evidence |
| **Verified Donor** | `donor@fundtrail.org` / `donor@vera.org` | Donate, inspect receipts, trace funds |
| **Certified Auditor** | `auditor@fundtrail.org` / `auditor@vera.org` | Review AI findings, approve proofs, sign multisig |
| **Platform Admin** | `admin@fundtrail.org` / `admin@vera.org` | System administration, platform oversight |

### Featured Demo Campaign:
- **Title**: `Government School Classroom — Jaipur`
- **Target Goal**: ₹10,00,000
- **Raised & Earmarked**: ₹7,50,000
- **Locked in Escrow**: ₹4,65,000
- **Released on Milestone 1**: ₹2,85,000 (Electrical Work — Proof verified, discrepancy resolved, 2/3 multisig signed, on-chain confirmed)
- **Public Audit Route**: `/campaigns/cccccccc-cccc-cccc-cccc-cccccccccccc/audit`

---

## 6. Automated Test Suites

VERA maintains automated test suites across every phase (321 programmatic tests, 0 failing):

```bash
# Run Solidity smart contract unit tests (21 tests)
npm run test:contracts

# Run Phase 1 Foundation & RBAC tests (37 tests)
npm run test:phase1

# Run Phase 2 Donation & Escrow Lifecycle tests (39 tests)
npm run test:phase2

# Run Phase 3 Proof, Hashing & Verification tests (65 tests)
npm run test:phase3

# Run Phase 4 Blockchain & Multisig tests (81 tests)
npm run test:phase4

# Run Phase 5 Public Audit, Reputation & Traceability tests (78 tests)
npm run test:phase5

# Validate TypeScript typing
npm run type-check

# Run Next.js production build
npm run build
```

---

## 7. Production VPS Deployment

Architecture:
```
Internet → Nginx (Port 80/443, SSL) → Next.js (Port 3000) → PostgreSQL 16 (vera-db)
```

```bash
# Build and run complete multi-container stack
docker compose up -d --build

# Run migrations and seed data in container
docker compose exec vera-app npm run db:migrate
docker compose exec vera-app npm run db:seed
```

See [docs/deployment.md](file:///d:/HackXxMUJ/docs/deployment.md) for full VPS, SSL, and backup documentation.

---

## 8. Documentation Sitemap

- [System Architecture](file:///d:/HackXxMUJ/docs/architecture.md)
- [VPS & Production Deployment](file:///d:/HackXxMUJ/docs/deployment.md)
- [Blockchain & Smart Contracts](file:///d:/HackXxMUJ/docs/blockchain.md)
- [Evidence Verification & AI Auditing](file:///d:/HackXxMUJ/docs/verification.md)

---

## 9. Important Limitations & Disclosures

1. **Testnet Cryptocurrency**: Blockchain operations execute on Ethereum testnets (Sepolia / Holesky / Hardhat). Testnet ether possesses zero real-world financial value and is used exclusively for tamper-evident cryptographic state transitions.
2. **Offline Reality Boundaries**: VERA guarantees that funds cannot move without recorded evidence and multi-signature authorization. It does not claim blockchain provides physical omniscience regarding offline vendor goods quality or physical worksmanship without human auditor inspection.
3. **Escrow Allocation**: In pooled community campaigns, fund trails reflect programmatic accounting allocation within the campaign escrow rather than tracking individual physical currency notes.
