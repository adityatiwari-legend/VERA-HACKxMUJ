export type UserRole = 'DONOR' | 'NGO' | 'AUDITOR' | 'ADMIN';

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export type DonationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export type MilestoneStatus =
  | 'LOCKED'
  | 'IN_PROGRESS'
  | 'PROOF_SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'RELEASED'
  | 'REJECTED'
  | 'FAILED';

export type FundTransactionType = 'DONATION' | 'LOCK' | 'RELEASE' | 'SPEND' | 'REFUND';

export type ProofStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export type AIStatus = 'PASS' | 'FLAG' | 'FAIL' | 'MANUAL_REVIEW' | 'ERROR';

export interface User {
  id: string;
  name: string;
  email: string;
  wallet_address: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserWithPasswordHash extends User {
  password_hash: string;
}

export type BlockchainStatus = 'NOT_SUBMITTED' | 'PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'FAILED';

export type ReleaseRequestStatus =
  | 'AWAITING_MULTISIG'
  | 'READY_TO_RELEASE'
  | 'RELEASE_SUBMITTED'
  | 'RELEASED'
  | 'REJECTED'
  | 'FAILED';

export interface Campaign {
  id: string;
  ngo_id: string;
  title: string;
  description: string;
  target_amount: number;
  raised_amount: number;
  released_amount: number;
  beneficiary: string;
  status: CampaignStatus;
  blockchain_campaign_id: string | null;
  blockchain_network?: string | null;
  blockchain_contract_address?: string | null;
  blockchain_status?: BlockchainStatus;
  created_at: string;
  updated_at: string;
  ngo_name?: string;
  ngo_email?: string;
  milestones_count?: number;
  donors_count?: number;
}

export interface Milestone {
  id: string;
  campaign_id: string;
  title: string;
  description: string;
  amount: number;
  sequence: number;
  status: MilestoneStatus;
  proof_required: boolean;
  blockchain_milestone_id?: string | null;
  blockchain_status?: BlockchainStatus;
  created_at: string;
  updated_at: string;
  active_proof_id?: string;
  active_proof_status?: ProofStatus;
  release_request?: ReleaseRequest | null;
}

export interface Donation {
  id: string;
  campaign_id: string;
  donor_id: string;
  amount: number;
  purpose: string | null;
  status: DonationStatus;
  reference: string;
  transaction_hash: string | null;
  blockchain_tx_hash?: string | null;
  blockchain_status?: BlockchainStatus;
  created_at: string;
  updated_at: string;
  donor_name?: string;
  campaign_title?: string;
  beneficiary?: string;
}

export interface FundTransaction {
  id: string;
  campaign_id: string;
  milestone_id: string | null;
  donation_id: string | null;
  type: FundTransactionType;
  amount: number;
  reference: string;
  transaction_hash: string | null;
  blockchain_tx_hash?: string | null;
  blockchain_block_number?: number | null;
  blockchain_status?: BlockchainStatus;
  created_at: string;
  milestone_title?: string;
}

export interface ReleaseRequest {
  id: string;
  campaign_id: string;
  milestone_id: string;
  proof_id: string | null;
  requested_amount: number;
  requested_by: string;
  status: ReleaseRequestStatus;
  required_approvals: number;
  current_approvals: number;
  blockchain_tx_hash: string | null;
  blockchain_status: BlockchainStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  milestone_title?: string;
  campaign_title?: string;
  requested_by_name?: string;
  approvals?: MultisigApproval[];
}

export interface MultisigApproval {
  id: string;
  release_request_id: string;
  approver_id: string;
  approver_role: string;
  approval_type: string;
  status: 'APPROVED' | 'REJECTED';
  comment: string | null;
  blockchain_tx_hash: string | null;
  created_at: string;
  approver_name?: string;
  approver_email?: string;
}

export interface ProofFile {
  id: string;
  proof_id: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  sha256_hash: string;
  uploaded_at: string;
}

export interface VerificationResult {
  id: string;
  proof_id: string;
  ai_status: AIStatus;
  confidence: number;
  extracted_amount: number | null;
  extracted_date: string | null;
  extracted_vendor: string | null;
  extracted_invoice_number: string | null;
  duplicate_detected: boolean;
  discrepancy_amount: number;
  notes: string | null;
  raw_result: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Proof {
  id: string;
  milestone_id: string;
  submitted_by: string;
  description: string;
  claimed_amount: number;
  status: ProofStatus;
  rejection_reason: string | null;
  submitted_at: string;
  updated_at: string;
  milestone_title?: string;
  milestone_amount?: number;
  campaign_id?: string;
  campaign_title?: string;
  ngo_name?: string;
  files?: ProofFile[];
  verification?: VerificationResult | null;
}

export interface AuditLog {
  id: string;
  campaign_id: string | null;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, any>;
  created_at: string;
  actor_name?: string;
  actor_role?: UserRole;
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}
