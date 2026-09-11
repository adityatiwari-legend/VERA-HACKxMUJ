import { PoolClient } from 'pg';
import { query } from './db';
import { AuditLog } from '../types';

export interface RecordAuditLogParams {
  campaignId: string | null;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  client?: PoolClient;
}

/**
 * Record an immutable audit log entry.
 * Uses parameterized SQL. Can run inside an existing transaction client or standalone.
 */
export async function recordAuditLog({
  campaignId,
  actorId,
  action,
  entityType,
  entityId,
  metadata = {},
  client,
}: RecordAuditLogParams): Promise<AuditLog> {
  const sql = `
    INSERT INTO audit_logs (
      campaign_id,
      actor_id,
      action,
      entity_type,
      entity_id,
      metadata
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, campaign_id, actor_id, action, entity_type, entity_id, metadata, created_at
  `;

  const values = [
    campaignId,
    actorId,
    action,
    entityType,
    entityId,
    JSON.stringify(metadata),
  ];

  if (client) {
    const res = await client.query(sql, values);
    return res.rows[0];
  } else {
    const res = await query<AuditLog>(sql, values);
    return res.rows[0];
  }
}

/**
 * Retrieve all audit log entries for a given campaign, newest first.
 */
export async function getAuditLogsForCampaign(campaignId: string): Promise<AuditLog[]> {
  const sql = `
    SELECT 
      a.id,
      a.campaign_id,
      a.actor_id,
      a.action,
      a.entity_type,
      a.entity_id,
      a.metadata,
      a.created_at,
      u.name as actor_name,
      u.role as actor_role
    FROM audit_logs a
    LEFT JOIN users u ON a.actor_id = u.id
    WHERE a.campaign_id = $1
    ORDER BY a.created_at DESC
  `;

  const res = await query<AuditLog>(sql, [campaignId]);
  return res.rows;
}
