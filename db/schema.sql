-- VERA Database Schema (Phase 3)
-- Direct PostgreSQL schema without ORM

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Migration Tracking Table
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('DONOR', 'NGO', 'AUDITOR', 'ADMIN')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ngo_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    target_amount NUMERIC(14,2) NOT NULL CHECK (target_amount > 0),
    raised_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (raised_amount >= 0),
    released_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (released_amount >= 0),
    beneficiary VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED')),
    blockchain_campaign_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_ngo_id ON campaigns(ngo_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);

-- Milestones Table
CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    sequence INTEGER NOT NULL DEFAULT 1 CHECK (sequence >= 1),
    status VARCHAR(50) NOT NULL DEFAULT 'LOCKED' CHECK (
        status IN ('LOCKED', 'IN_PROGRESS', 'PROOF_SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'RELEASED', 'REJECTED', 'FAILED')
    ),
    proof_required BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_campaign_milestone_sequence UNIQUE (campaign_id, sequence)
);

CREATE INDEX IF NOT EXISTS idx_milestones_campaign_id ON milestones(campaign_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON milestones(status);
CREATE INDEX IF NOT EXISTS idx_milestones_sequence ON milestones(campaign_id, sequence);

-- Donations Table
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE RESTRICT,
    donor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    purpose VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')),
    reference VARCHAR(100) UNIQUE NOT NULL,
    transaction_hash VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_reference ON donations(reference);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);

-- Fund Transactions Table
CREATE TABLE IF NOT EXISTS fund_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE RESTRICT,
    milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
    donation_id UUID REFERENCES donations(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('DONATION', 'LOCK', 'RELEASE', 'SPEND', 'REFUND')),
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    reference VARCHAR(100) NOT NULL,
    transaction_hash VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fund_transactions_campaign_id ON fund_transactions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_fund_transactions_milestone_id ON fund_transactions(milestone_id);
CREATE INDEX IF NOT EXISTS idx_fund_transactions_donation_id ON fund_transactions(donation_id);
CREATE INDEX IF NOT EXISTS idx_fund_transactions_type ON fund_transactions(type);
CREATE INDEX IF NOT EXISTS idx_fund_transactions_created_at ON fund_transactions(created_at DESC);

-- Proofs Table
CREATE TABLE IF NOT EXISTS proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    claimed_amount NUMERIC(14,2) NOT NULL CHECK (claimed_amount > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED')),
    rejection_reason TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proofs_milestone_id ON proofs(milestone_id);
CREATE INDEX IF NOT EXISTS idx_proofs_submitted_by ON proofs(submitted_by);
CREATE INDEX IF NOT EXISTS idx_proofs_status ON proofs(status);
CREATE INDEX IF NOT EXISTS idx_proofs_submitted_at ON proofs(submitted_at DESC);

-- Proof Files Table
CREATE TABLE IF NOT EXISTS proof_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proof_id UUID NOT NULL REFERENCES proofs(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proof_files_proof_id ON proof_files(proof_id);
CREATE INDEX IF NOT EXISTS idx_proof_files_sha256_hash ON proof_files(sha256_hash);

-- Verification Results Table
CREATE TABLE IF NOT EXISTS verification_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proof_id UUID NOT NULL REFERENCES proofs(id) ON DELETE CASCADE,
    ai_status VARCHAR(50) NOT NULL CHECK (ai_status IN ('PASS', 'FLAG', 'FAIL', 'MANUAL_REVIEW', 'ERROR')),
    confidence NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    extracted_amount NUMERIC(14,2),
    extracted_date DATE,
    extracted_vendor VARCHAR(255),
    extracted_invoice_number VARCHAR(100),
    duplicate_detected BOOLEAN NOT NULL DEFAULT false,
    discrepancy_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    raw_result JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_results_proof_id ON verification_results(proof_id);
CREATE INDEX IF NOT EXISTS idx_verification_results_ai_status ON verification_results(ai_status);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    actor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_campaign_id ON audit_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Release Requests Table (Phase 4 Multisig Release)
CREATE TABLE IF NOT EXISTS release_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    requested_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'AWAITING_MULTISIG' CHECK (
        status IN ('AWAITING_MULTISIG', 'READY_FOR_RELEASE', 'RELEASED', 'REJECTED', 'FAILED')
    ),
    required_approvals INTEGER NOT NULL DEFAULT 2,
    current_approvals INTEGER NOT NULL DEFAULT 0,
    blockchain_tx_hash VARCHAR(255),
    blockchain_status VARCHAR(50) DEFAULT 'NOT_SUBMITTED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_release_requests_campaign_id ON release_requests(campaign_id);
CREATE INDEX IF NOT EXISTS idx_release_requests_milestone_id ON release_requests(milestone_id);
CREATE INDEX IF NOT EXISTS idx_release_requests_status ON release_requests(status);

-- Multisig Approvals Table (Phase 4 Signatures)
CREATE TABLE IF NOT EXISTS multisig_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_request_id UUID NOT NULL REFERENCES release_requests(id) ON DELETE CASCADE,
    milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    signer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    signer_role VARCHAR(50) NOT NULL,
    signer_address VARCHAR(255),
    comment TEXT,
    blockchain_tx_hash VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_signer_per_release UNIQUE (release_request_id, signer_id)
);

CREATE INDEX IF NOT EXISTS idx_multisig_approvals_request_id ON multisig_approvals(release_request_id);
CREATE INDEX IF NOT EXISTS idx_multisig_approvals_signer_id ON multisig_approvals(signer_id);

