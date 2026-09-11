import bcrypt from 'bcryptjs';
import { query, withTransaction, db } from '../lib/db';

async function seedDatabase() {
  console.log('🌱 Seeding FundTrail Database...');

  try {
    const defaultPassword = 'Password123!';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    await withTransaction(async (client) => {
      // 1. Insert Demo Users
      const ngoUserRes = await client.query(
        `INSERT INTO users (id, name, email, password_hash, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
         RETURNING id`,
        [
          '11111111-1111-1111-1111-111111111111',
          'Care India Foundation',
          'ngo@fundtrail.org',
          passwordHash,
          'NGO',
        ]
      );
      const ngoId = ngoUserRes.rows[0].id;

      await client.query(
        `INSERT INTO users (id, name, email, password_hash, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
        [
          '22222222-2222-2222-2222-222222222222',
          'Aarav Sharma',
          'donor@fundtrail.org',
          passwordHash,
          'DONOR',
        ]
      );

      await client.query(
        `INSERT INTO users (id, name, email, password_hash, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
        [
          '33333333-3333-3333-3333-333333333333',
          'Priya Mehta (Auditor)',
          'auditor@fundtrail.org',
          passwordHash,
          'AUDITOR',
        ]
      );

      // 2. Insert Demo Campaigns
      const campaign1Id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
      await client.query(
        `INSERT INTO campaigns (id, ngo_id, title, description, target_amount, raised_amount, released_amount, beneficiary, status)
         VALUES ($1, $2, $3, $4, $5, 0.00, 0.00, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [
          campaign1Id,
          ngoId,
          'Clean Water & Sanitation for Rajasthan Schools',
          'Providing sustainable solar-powered clean drinking water filtration systems and sanitation facilities to 12 government primary schools across rural Jaipur district.',
          850000.0,
          'Rural Primary School Students (1,400+ children)',
          'ACTIVE',
        ]
      );

      const campaign2Id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
      await client.query(
        `INSERT INTO campaigns (id, ngo_id, title, description, target_amount, raised_amount, released_amount, beneficiary, status)
         VALUES ($1, $2, $3, $4, $5, 0.00, 0.00, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [
          campaign2Id,
          ngoId,
          'Emergency Medical Supplies & First-Aid Kiosks',
          'Setting up 5 emergency health stabilization kiosks and oxygen reserves in remote tribal villages.',
          420000.0,
          'Tribal Village Community Health Centers',
          'DRAFT',
        ]
      );

      // 3. Insert Initial Audit Logs
      await client.query(
        `INSERT INTO audit_logs (campaign_id, actor_id, action, entity_type, entity_id, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [
          campaign1Id,
          ngoId,
          'CREATE_CAMPAIGN',
          'CAMPAIGN',
          campaign1Id,
          JSON.stringify({
            title: 'Clean Water & Sanitation for Rajasthan Schools',
            target_amount: 850000.0,
            beneficiary: 'Rural Primary School Students (1,400+ children)',
            initial_status: 'ACTIVE',
          }),
        ]
      );

      await client.query(
        `INSERT INTO audit_logs (campaign_id, actor_id, action, entity_type, entity_id, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [
          campaign2Id,
          ngoId,
          'CREATE_CAMPAIGN',
          'CAMPAIGN',
          campaign2Id,
          JSON.stringify({
            title: 'Emergency Medical Supplies & First-Aid Kiosks',
            target_amount: 420000.0,
            beneficiary: 'Tribal Village Community Health Centers',
            initial_status: 'DRAFT',
          }),
        ]
      );
    });

    console.log('✅ Demo data successfully seeded!');
    console.log('--------------------------------------------------');
    console.log('Demo Credentials (Password: Password123!):');
    console.log('  NGO:     ngo@fundtrail.org');
    console.log('  DONOR:   donor@fundtrail.org');
    console.log('  AUDITOR: auditor@fundtrail.org');
    console.log('--------------------------------------------------');
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

seedDatabase();
