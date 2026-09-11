export type UserRole = 'DONOR' | 'NGO' | 'AUDITOR' | 'ADMIN';

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

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
  created_at: string;
  updated_at: string;
  ngo_name?: string;
  ngo_email?: string;
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
