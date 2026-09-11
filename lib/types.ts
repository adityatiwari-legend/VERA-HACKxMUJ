export interface AuditTransaction {
  id: string;
  timestamp: string;
  campaign: string;
  category: "Infrastructure" | "Education" | "Healthcare" | "Disaster Relief" | "Clean Energy";
  milestone: string;
  amount: number;
  currency: string;
  status: "RELEASED" | "ESCROW_LOCKED" | "AUDITING" | "OCR_VERIFIED";
  txHash: string;
  evidenceHash: string;
  contractor: string;
  auditorMultiSig: string;
  ocrDiscrepancy: number;
  geoTag: string;
  verifiedAt: string;
}

export interface EscrowMilestone {
  id: number;
  title: string;
  budget: number;
  released: number;
  status: "COMPLETED" | "IN_PROGRESS" | "PENDING";
  evidenceCount: number;
  hash: string;
  signers: number;
  requiredSigners: number;
}

// Re-export core domain types for compatibility
export * from '@/types';
