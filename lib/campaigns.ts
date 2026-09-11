import { query, withTransaction } from './db';
import { Campaign, CampaignStatus } from '../types';
import { CreateCampaignInput, UpdateCampaignInput } from './validation';
import { recordAuditLog } from './audit';
import { ForbiddenError, NotFoundError, AppError } from './permissions';

/**
 * Valid state transitions for campaigns
 */
const VALID_STATUS_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  DRAFT: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['PAUSED', 'COMPLETED', 'CANCELLED'],
  PAUSED: ['ACTIVE', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

/**
 * Create a new campaign under the authenticated NGO
 */
export async function createCampaign(
  ngoId: string,
  input: CreateCampaignInput
): Promise<Campaign> {
  return withTransaction(async (client) => {
    const insertSql = `
      INSERT INTO campaigns (
        ngo_id,
        title,
        description,
        target_amount,
        raised_amount,
        released_amount,
        beneficiary,
        status
      )
      VALUES ($1, $2, $3, $4, 0.00, 0.00, $5, $6)
      RETURNING *
    `;

    const initialStatus = input.status || 'DRAFT';
    const res = await client.query<Campaign>(insertSql, [
      ngoId,
      input.title,
      input.description,
      input.target_amount,
      input.beneficiary,
      initialStatus,
    ]);

    const campaign = res.rows[0];

    // Record audit log
    await recordAuditLog({
      campaignId: campaign.id,
      actorId: ngoId,
      action: 'CREATE_CAMPAIGN',
      entityType: 'CAMPAIGN',
      entityId: campaign.id,
      metadata: {
        title: campaign.title,
        target_amount: campaign.target_amount,
        beneficiary: campaign.beneficiary,
        status: campaign.status,
      },
      client,
    });

    return campaign;
  });
}

/**
 * List all campaigns belonging to a specific NGO
 */
export async function getCampaignsForNgo(ngoId: string): Promise<Campaign[]> {
  const sql = `
    SELECT 
      id,
      ngo_id,
      title,
      description,
      target_amount::numeric as target_amount,
      raised_amount::numeric as raised_amount,
      released_amount::numeric as released_amount,
      beneficiary,
      status,
      blockchain_campaign_id,
      created_at,
      updated_at
    FROM campaigns
    WHERE ngo_id = $1
    ORDER BY created_at DESC
  `;

  const res = await query<Campaign>(sql, [ngoId]);
  return res.rows;
}

/**
 * Get single campaign by ID with NGO details
 */
export async function getCampaignById(id: string): Promise<Campaign | null> {
  const sql = `
    SELECT 
      c.id,
      c.ngo_id,
      c.title,
      c.description,
      c.target_amount::numeric as target_amount,
      c.raised_amount::numeric as raised_amount,
      c.released_amount::numeric as released_amount,
      c.beneficiary,
      c.status,
      c.blockchain_campaign_id,
      c.created_at,
      c.updated_at,
      u.name as ngo_name,
      u.email as ngo_email
    FROM campaigns c
    JOIN users u ON c.ngo_id = u.id
    WHERE c.id = $1
  `;

  const res = await query<Campaign>(sql, [id]);
  return res.rows[0] || null;
}

/**
 * Update an existing campaign's mutable details
 */
export async function updateCampaign(
  campaignId: string,
  ngoId: string,
  updates: UpdateCampaignInput
): Promise<Campaign> {
  return withTransaction(async (client) => {
    // 1. Lock and check existing record
    const existingRes = await client.query<Campaign>(
      `SELECT * FROM campaigns WHERE id = $1 FOR UPDATE`,
      [campaignId]
    );

    if (existingRes.rowCount === 0) {
      throw new NotFoundError('Campaign not found');
    }

    const existing = existingRes.rows[0];

    // Enforce ownership
    if (existing.ngo_id !== ngoId) {
      throw new ForbiddenError('You do not have permission to modify this campaign');
    }

    // Disallow updates on completed or cancelled campaigns
    if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
      throw new AppError(`Cannot modify a campaign in '${existing.status}' status`, 400);
    }

    const title = updates.title ?? existing.title;
    const description = updates.description ?? existing.description;
    const target_amount = updates.target_amount ?? existing.target_amount;
    const beneficiary = updates.beneficiary ?? existing.beneficiary;

    const updateSql = `
      UPDATE campaigns
      SET 
        title = $1,
        description = $2,
        target_amount = $3,
        beneficiary = $4,
        updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `;

    const updatedRes = await client.query<Campaign>(updateSql, [
      title,
      description,
      target_amount,
      beneficiary,
      campaignId,
    ]);

    const updated = updatedRes.rows[0];

    // Record audit log
    await recordAuditLog({
      campaignId,
      actorId: ngoId,
      action: 'UPDATE_CAMPAIGN',
      entityType: 'CAMPAIGN',
      entityId: campaignId,
      metadata: {
        previous: {
          title: existing.title,
          target_amount: existing.target_amount,
          beneficiary: existing.beneficiary,
        },
        current: {
          title: updated.title,
          target_amount: updated.target_amount,
          beneficiary: updated.beneficiary,
        },
      },
      client,
    });

    return updated;
  });
}

/**
 * Change campaign status with strict transition rules
 */
export async function updateCampaignStatus(
  campaignId: string,
  ngoId: string,
  newStatus: CampaignStatus
): Promise<Campaign> {
  return withTransaction(async (client) => {
    const existingRes = await client.query<Campaign>(
      `SELECT * FROM campaigns WHERE id = $1 FOR UPDATE`,
      [campaignId]
    );

    if (existingRes.rowCount === 0) {
      throw new NotFoundError('Campaign not found');
    }

    const existing = existingRes.rows[0];

    if (existing.ngo_id !== ngoId) {
      throw new ForbiddenError('You do not have permission to modify this campaign');
    }

    if (existing.status === newStatus) {
      return existing;
    }

    const allowedNext = VALID_STATUS_TRANSITIONS[existing.status] || [];
    if (!allowedNext.includes(newStatus)) {
      throw new AppError(
        `Invalid status transition: Cannot change status from '${existing.status}' to '${newStatus}'`,
        400
      );
    }

    const updateSql = `
      UPDATE campaigns
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const updatedRes = await client.query<Campaign>(updateSql, [newStatus, campaignId]);
    const updated = updatedRes.rows[0];

    // Record audit log
    await recordAuditLog({
      campaignId,
      actorId: ngoId,
      action: 'CHANGE_CAMPAIGN_STATUS',
      entityType: 'CAMPAIGN',
      entityId: campaignId,
      metadata: {
        previous_status: existing.status,
        new_status: newStatus,
      },
      client,
    });

    return updated;
  });
}

/**
 * Soft delete / cancel a campaign
 */
export async function cancelCampaign(campaignId: string, ngoId: string): Promise<Campaign> {
  return updateCampaignStatus(campaignId, ngoId, 'CANCELLED');
}

/**
 * Get aggregate campaign stats for an NGO dashboard
 */
export async function getNgoCampaignStats(ngoId: string) {
  const sql = `
    SELECT 
      COUNT(*)::int as total_campaigns,
      COUNT(*) FILTER (WHERE status = 'ACTIVE')::int as active_campaigns,
      COUNT(*) FILTER (WHERE status = 'DRAFT')::int as draft_campaigns,
      COUNT(*) FILTER (WHERE status = 'COMPLETED')::int as completed_campaigns,
      COALESCE(SUM(target_amount), 0)::numeric as total_target_amount
    FROM campaigns
    WHERE ngo_id = $1
  `;

  const res = await query<{
    total_campaigns: number;
    active_campaigns: number;
    draft_campaigns: number;
    completed_campaigns: number;
    total_target_amount: number;
  }>(sql, [ngoId]);

  return res.rows[0];
}
