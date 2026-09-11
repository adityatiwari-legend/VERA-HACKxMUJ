import bcrypt from 'bcryptjs';
import { withTransaction, db } from '../lib/db';

async function seedDatabase() {
  console.log('🌱 Seeding VERA Database (Phase 5 Productization)...');

  try {
    const defaultPassword = 'Password123!';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    await withTransaction(async (client) => {
      // 1. Insert Demo Users
      const ngoId = '11111111-1111-1111-1111-111111111111';
      await client.query(
        `INSERT INTO users (id, name, email, password_hash, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role`,
        [
          ngoId,
          'Rajasthan Education Foundation',
          'ngo@fundtrail.org',
          passwordHash,
          'NGO',
        ]
      );

      const donorId = '22222222-2222-2222-2222-222222222222';
      await client.query(
        `INSERT INTO users (id, name, email, password_hash, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role`,
        [
          donorId,
          'Ananya Patel',
          'donor@fundtrail.org',
          passwordHash,
          'DONOR',
        ]
      );

      const auditorId = '33333333-3333-3333-3333-333333333333';
      await client.query(
        `INSERT INTO users (id, name, email, password_hash, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role`,
        [
          auditorId,
          'Priya Sharma (Auditor ID: AUD-JP-2026)',
          'auditor@fundtrail.org',
          passwordHash,
          'AUDITOR',
        ]
      );

      const adminId = '55555555-5555-5555-5555-555555555551';
      await client.query(
        `INSERT INTO users (id, name, email, password_hash, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role`,
        [
          adminId,
          'Vikram Malhotra (VERA Admin)',
          'admin@fundtrail.org',
          passwordHash,
          'ADMIN',
        ]
      );

      // Also ensure vera.org aliases exist for convenient demo testing
      await client.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ('Rajasthan Education Foundation', 'ngo@vera.org', $1, 'NGO'),
                ('Ananya Patel', 'donor@vera.org', $1, 'DONOR'),
                ('Priya Sharma (Auditor)', 'auditor@vera.org', $1, 'AUDITOR'),
                ('Platform Admin', 'admin@vera.org', $1, 'ADMIN')
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash`,
        [passwordHash]
      );

      // 2. Primary Phase 5 Demo Campaign: "Government School Classroom — Jaipur"
      const campaignId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
      const campContractAddr = process.env.CONTRACT_ADDRESS || '0x0B306BF915C4d645ff596e518fAf3F9669b97016';
      const onChainCampId = '0x0e1707d56975ebedc4f866980002c139d0945cc6f86e21be7aab701140a468f6';

      await client.query(
        `INSERT INTO campaigns (
           id, ngo_id, title, description, target_amount, raised_amount, released_amount, 
           beneficiary, status, blockchain_campaign_id, blockchain_network, blockchain_contract_address, blockchain_status
         )
         VALUES ($1, $2, $3, $4, 1000000.00, 750000.00, 285000.00, $5, 'ACTIVE', $6, 'hardhat', $7, 'CONFIRMED')
         ON CONFLICT (id) DO UPDATE SET 
           ngo_id = EXCLUDED.ngo_id,
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           target_amount = 1000000.00,
           raised_amount = 750000.00,
           released_amount = 285000.00,
           status = 'ACTIVE',
           blockchain_campaign_id = $6,
           blockchain_contract_address = $7,
           blockchain_status = 'CONFIRMED'`,
        [
          campaignId,
          ngoId,
          'Government School Classroom — Jaipur',
          'Comprehensive infrastructure modernization for 6 rural primary classrooms at Government Secondary School, Jaipur. Upgrades include certified electrical cabling, child-safe switchgear, ergonomic dual desks, and wall weatherproofing.',
          'Jaipur Primary School Students (250+ children)',
          onChainCampId,
          campContractAddr,
        ]
      );

      // 3. Milestones for Jaipur School using ON CONFLICT (campaign_id, sequence)
      const ms1Res = await client.query(
        `INSERT INTO milestones (
           campaign_id, title, description, amount, released_amount, sequence, status, proof_required, blockchain_status
         )
         VALUES ($1, 'Electrical Work',
                 'Concealed copper wiring, LED tube fixtures, modular switchboards, safety MCBs, and ventilation fans installed in 6 classrooms.',
                 300000.00, 285000.00, 1, 'RELEASED', true, 'CONFIRMED')
         ON CONFLICT (campaign_id, sequence) DO UPDATE SET 
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           amount = EXCLUDED.amount,
           released_amount = EXCLUDED.released_amount,
           status = EXCLUDED.status,
           blockchain_status = EXCLUDED.blockchain_status
         RETURNING id`,
        [campaignId]
      );
      const ms1Id = ms1Res.rows[0].id;

      const ms2Res = await client.query(
        `INSERT INTO milestones (
           campaign_id, title, description, amount, released_amount, sequence, status, proof_required, blockchain_status
         )
         VALUES ($1, 'Furniture & Ergonomic Desks',
                 'Procurement and installation of 75 dual-seater heavy-duty steel and wooden study benches with backpack hooks.',
                 250000.00, 0.00, 2, 'IN_PROGRESS', true, 'CONFIRMED')
         ON CONFLICT (campaign_id, sequence) DO UPDATE SET 
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           amount = EXCLUDED.amount,
           released_amount = EXCLUDED.released_amount,
           status = EXCLUDED.status,
           blockchain_status = EXCLUDED.blockchain_status
         RETURNING id`,
        [campaignId]
      );
      const ms2Id = ms2Res.rows[0].id;

      const ms3Res = await client.query(
        `INSERT INTO milestones (
           campaign_id, title, description, amount, released_amount, sequence, status, proof_required, blockchain_status
         )
         VALUES ($1, 'Classroom Renovation & Painting',
                 'Wall plaster repairs, primer sealing, non-toxic anti-fungal paint coats, blackboard refinishing, and classroom doorway repairs.',
                 450000.00, 0.00, 3, 'LOCKED', true, 'CONFIRMED')
         ON CONFLICT (campaign_id, sequence) DO UPDATE SET 
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           amount = EXCLUDED.amount,
           released_amount = EXCLUDED.released_amount,
           status = EXCLUDED.status,
           blockchain_status = EXCLUDED.blockchain_status
         RETURNING id`,
        [campaignId]
      );
      const ms3Id = ms3Res.rows[0].id;

      // 4. Milestone 1 Proof, Verification & Release Records
      const proofId = '66666666-6666-6666-6666-666666666661';
      await client.query(
        `INSERT INTO proofs (id, milestone_id, submitted_by, claimed_amount, description, status)
         VALUES ($1, $2, $3, 300000.00, $4, 'APPROVED')
         ON CONFLICT (id) DO UPDATE SET 
           milestone_id = EXCLUDED.milestone_id,
           status = 'APPROVED', 
           claimed_amount = 300000.00`,
        [
          proofId,
          ms1Id,
          ngoId,
          'Milestone 1 execution completed by ABC Electrical Works. Attached GST tax invoice, payment receipt, and classroom completion photographs.',
        ]
      );

      // Proof files
      await client.query(
        `INSERT INTO proof_files (id, proof_id, file_name, file_path, file_size, mime_type, sha256_hash)
         VALUES 
           ('77777777-7777-7777-7777-777777777771', $1, 'invoice_abc_electricals.pdf', 'storage/proofs/invoice_abc_electricals.pdf', 245100, 'application/pdf', '3a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b'),
           ('77777777-7777-7777-7777-777777777772', $1, 'vendor_bank_receipt.pdf', 'storage/proofs/vendor_bank_receipt.pdf', 184200, 'application/pdf', '4b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c'),
           ('77777777-7777-7777-7777-777777777773', $1, 'classroom_wiring_photo.jpg', 'storage/proofs/classroom_wiring_photo.jpg', 845000, 'image/jpeg', '5c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d')
         ON CONFLICT (id) DO NOTHING`,
        [proofId]
      );

      // Verification result with realistic discrepancy
      await client.query(
        `INSERT INTO verification_results (
           id, proof_id, ai_status, confidence, extracted_amount, discrepancy_amount, 
           extracted_vendor, extracted_invoice_number, notes, raw_result
         )
         VALUES ($1, $2, 'FLAG', 94.00, 285000.00, 15000.00, 'ABC Electrical Works', 'INV-2026-0891', $3, $4)
         ON CONFLICT (id) DO UPDATE SET 
           proof_id = EXCLUDED.proof_id,
           ai_status = 'FLAG', 
           extracted_amount = 285000.00, 
           discrepancy_amount = 15000.00`,
        [
          '88888888-8888-8888-8888-888888888881',
          proofId,
          'OCR detected invoice line items total ₹2,85,000. Claimed amount was ₹3,00,000 (discrepancy of ₹15,000). Approved at actual invoice cost of ₹2,85,000.',
          JSON.stringify({
            vendor: 'ABC Electrical Works',
            tax_id: 'GSTIN08AABCA1234F1Z5',
            line_items: [
              { item: 'Copper wiring & conduits', amount: 95000 },
              { item: 'LED fixtures & MCB switchgear', amount: 110000 },
              { item: 'Installation labor', amount: 80000 },
            ],
            total: 285000,
          }),
        ]
      );

      // Release Request & Multisig records
      const releaseReqId = '99999999-9999-9999-9999-999999999991';
      const releaseTxHash = '0xb4c840107fee6507a4af99e1e4bbed49db339f383aa244fc55ff9f2bde08420e';
      await client.query(
        `INSERT INTO release_requests (
           id, campaign_id, milestone_id, proof_id, amount, requested_amount, requested_by, 
           status, required_approvals, current_approvals, blockchain_tx_hash, blockchain_status
         )
         VALUES ($1, $2, $3, $4, 285000.00, 285000.00, $5, 'RELEASED', 2, 2, $6, 'CONFIRMED')
         ON CONFLICT (id) DO UPDATE SET 
           milestone_id = EXCLUDED.milestone_id,
           proof_id = EXCLUDED.proof_id,
           status = 'RELEASED',
           current_approvals = 2,
           blockchain_tx_hash = $6,
           blockchain_status = 'CONFIRMED'`,
        [
          releaseReqId,
          campaignId,
          ms1Id,
          proofId,
          ngoId,
          releaseTxHash,
        ]
      );

      // Multisig approvals
      await client.query(
        `INSERT INTO multisig_approvals (
           id, release_request_id, milestone_id, signer_id, approver_id, signer_role, approver_role, 
           signer_address, comment, blockchain_tx_hash, status
         )
         VALUES 
           ('aaaaaaaa-1111-1111-1111-111111111111', $1, $2, $3, $3, 'NGO_ADMIN', 'NGO_ADMIN', '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', 'Work executed per engineering plan.', '0xaa112233445566778899aabbccddeeff00112233445566778899aabbccddeeff', 'APPROVED'),
           ('aaaaaaaa-2222-2222-2222-222222222222', $1, $2, $4, $4, 'AUDITOR', 'AUDITOR', '0x90F79bf6EB2c4f870365E785982E1f101E93b906', 'Verified corrected invoice amount of ₹2,85,000 against electrical vendor ledger.', '0xbb2233445566778899aabbccddeeff00112233445566778899aabbccddeeff00', 'APPROVED')
         ON CONFLICT (release_request_id, signer_id) DO UPDATE SET 
           milestone_id = EXCLUDED.milestone_id,
           status = 'APPROVED'`,
        [releaseReqId, ms1Id, ngoId, auditorId]
      );

      // 5. Donations totaling ₹7,50,000
      const don1Id = '55555555-5555-5555-5555-555555555551';
      const donTxHash1 = '0xe8fc50f79931bae3f6721e6690e7ef4078c5d68b772e73935982becb455bf274';
      await client.query(
        `INSERT INTO donations (
           id, campaign_id, donor_id, amount, purpose, status, reference, transaction_hash, blockchain_tx_hash, blockchain_status
         )
         VALUES ($1, $2, $3, 500000.00, 'Primary classroom electrical modernization', 'CONFIRMED', 'VERA-DON-JP-500K', $4, $4, 'CONFIRMED')
         ON CONFLICT (id) DO UPDATE SET amount = 500000.00, status = 'CONFIRMED'`,
        [don1Id, campaignId, donorId, donTxHash1]
      );

      const don2Id = '55555555-5555-5555-5555-555555555552';
      const donTxHash2 = '0xf9ad60f89931bae3f6721e6690e7ef4078c5d68b772e73935982becb455bf385';
      await client.query(
        `INSERT INTO donations (
           id, campaign_id, donor_id, amount, purpose, status, reference, transaction_hash, blockchain_tx_hash, blockchain_status
         )
         VALUES ($1, $2, $3, 250000.00, 'Classroom desks and study infrastructure', 'CONFIRMED', 'VERA-DON-JP-250K', $4, $4, 'CONFIRMED')
         ON CONFLICT (id) DO UPDATE SET amount = 250000.00, status = 'CONFIRMED'`,
        [don2Id, campaignId, donorId, donTxHash2]
      );

      // 6. Fund Transactions (Donation, Lock, Release)
      await client.query(
        `INSERT INTO fund_transactions (
           campaign_id, donation_id, milestone_id, type, amount, reference, transaction_hash, blockchain_tx_hash, blockchain_status
         )
         VALUES 
           ($1, $2, NULL, 'DONATION', 500000.00, 'DON-VERA-DON-JP-500K', $4, $4, 'CONFIRMED'),
           ($1, $2, NULL, 'LOCK', 500000.00, 'LOCK-VERA-DON-JP-500K', $4, $4, 'CONFIRMED'),
           ($1, $3, NULL, 'DONATION', 250000.00, 'DON-VERA-DON-JP-250K', $5, $5, 'CONFIRMED'),
           ($1, $3, NULL, 'LOCK', 250000.00, 'LOCK-VERA-DON-JP-250K', $5, $5, 'CONFIRMED'),
           ($1, NULL, $6, 'RELEASE', 285000.00, 'REL-MS-1-ELECTRICAL', $7, $7, 'CONFIRMED')
         ON CONFLICT (id) DO NOTHING`,
        [campaignId, don1Id, don2Id, donTxHash1, donTxHash2, ms1Id, releaseTxHash]
      );

      // 7. Full Chronological Audit Logs
      const baseTime = new Date('2026-09-11T10:00:00Z').getTime();

      const auditEntries = [
        {
          action: 'CREATE_CAMPAIGN',
          actor: ngoId,
          entityType: 'CAMPAIGN',
          entityId: campaignId,
          time: new Date(baseTime).toISOString(),
          meta: { target_amount: 1000000.0, title: 'Government School Classroom — Jaipur' },
        },
        {
          action: 'CREATE_MILESTONE',
          actor: ngoId,
          entityType: 'MILESTONE',
          entityId: ms1Id,
          time: new Date(baseTime + 15 * 60000).toISOString(),
          meta: { title: 'Electrical Work', amount: 300000.0, sequence: 1 },
        },
        {
          action: 'CREATE_MILESTONE',
          actor: ngoId,
          entityType: 'MILESTONE',
          entityId: ms2Id,
          time: new Date(baseTime + 20 * 60000).toISOString(),
          meta: { title: 'Furniture & Desks', amount: 250000.0, sequence: 2 },
        },
        {
          action: 'CREATE_MILESTONE',
          actor: ngoId,
          entityType: 'MILESTONE',
          entityId: ms3Id,
          time: new Date(baseTime + 25 * 60000).toISOString(),
          meta: { title: 'Classroom Renovation & Painting', amount: 450000.0, sequence: 3 },
        },
        {
          action: 'DONATION_CONFIRMED',
          actor: donorId,
          entityType: 'DONATION',
          entityId: don1Id,
          time: new Date(baseTime + 60 * 60000).toISOString(),
          meta: { amount: 500000.0, reference: 'VERA-DON-JP-500K', tx_hash: donTxHash1 },
        },
        {
          action: 'FUNDS_LOCKED',
          actor: ngoId,
          entityType: 'CAMPAIGN',
          entityId: campaignId,
          time: new Date(baseTime + 60 * 60000).toISOString(),
          meta: { amount_locked: 500000.0, accounting_state: 'LOCKED_IN_ESCROW' },
        },
        {
          action: 'DONATION_CONFIRMED',
          actor: donorId,
          entityType: 'DONATION',
          entityId: don2Id,
          time: new Date(baseTime + 90 * 60000).toISOString(),
          meta: { amount: 250000.0, reference: 'VERA-DON-JP-250K', tx_hash: donTxHash2 },
        },
        {
          action: 'FUNDS_LOCKED',
          actor: ngoId,
          entityType: 'CAMPAIGN',
          entityId: campaignId,
          time: new Date(baseTime + 90 * 60000).toISOString(),
          meta: { amount_locked: 250000.0, accounting_state: 'LOCKED_IN_ESCROW' },
        },
        {
          action: 'PROOF_SUBMITTED_FOR_REVIEW',
          actor: ngoId,
          entityType: 'PROOF',
          entityId: proofId,
          time: new Date(baseTime + 180 * 60000).toISOString(),
          meta: { claimed_amount: 300000.0, milestone_id: ms1Id, files_count: 3 },
        },
        {
          action: 'PROOF_ANALYSIS_COMPLETED',
          actor: ngoId,
          entityType: 'PROOF',
          entityId: proofId,
          time: new Date(baseTime + 182 * 60000).toISOString(),
          meta: {
            status: 'FLAG',
            claimed_amount: 300000.0,
            detected_amount: 285000.0,
            discrepancy_amount: 15000.0,
            milestone_id: ms1Id,
          },
        },
        {
          action: 'PROOF_APPROVED',
          actor: auditorId,
          entityType: 'PROOF',
          entityId: proofId,
          time: new Date(baseTime + 210 * 60000).toISOString(),
          meta: {
            milestone_id: ms1Id,
            approved_amount: 285000.0,
            comment: 'Auditor approved corrected expenditure of ₹2,85,000.',
          },
        },
        {
          action: 'RELEASE_REQUEST_CREATED',
          actor: ngoId,
          entityType: 'RELEASE_REQUEST',
          entityId: releaseReqId,
          time: new Date(baseTime + 220 * 60000).toISOString(),
          meta: { milestone_id: ms1Id, requested_amount: 285000.0 },
        },
        {
          action: 'MULTISIG_APPROVAL',
          actor: ngoId,
          entityType: 'RELEASE_REQUEST',
          entityId: releaseReqId,
          time: new Date(baseTime + 225 * 60000).toISOString(),
          meta: { milestone_id: ms1Id, signer_role: 'NGO_ADMIN', current_approvals: 1 },
        },
        {
          action: 'MULTISIG_APPROVAL',
          actor: auditorId,
          entityType: 'RELEASE_REQUEST',
          entityId: releaseReqId,
          time: new Date(baseTime + 230 * 60000).toISOString(),
          meta: { milestone_id: ms1Id, signer_role: 'AUDITOR', current_approvals: 2 },
        },
        {
          action: 'FUNDS_RELEASED',
          actor: auditorId,
          entityType: 'RELEASE_REQUEST',
          entityId: releaseReqId,
          time: new Date(baseTime + 235 * 60000).toISOString(),
          meta: {
            milestone_id: ms1Id,
            amount: 285000.0,
            tx_hash: releaseTxHash,
            recipient: 'ABC Electrical Works',
          },
        },
      ];

      for (const entry of auditEntries) {
        await client.query(
          `INSERT INTO audit_logs (campaign_id, actor_id, action, entity_type, entity_id, metadata, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            campaignId,
            entry.actor,
            entry.action,
            entry.entityType,
            entry.entityId,
            JSON.stringify(entry.meta),
            entry.time,
          ]
        );
      }

      // Also ensure existing secondary campaigns exist
      await client.query(
        `INSERT INTO campaigns (id, ngo_id, title, description, target_amount, raised_amount, released_amount, beneficiary, status)
         VALUES 
           ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', $1, 'Clean Water & Sanitation for Rajasthan Schools', 'Solar-powered water filtration systems for 12 primary schools.', 850000.00, 150000.00, 0.00, 'Rural Primary School Students', 'ACTIVE'),
           ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', $1, 'Emergency Medical Supplies & First-Aid Kiosks', 'Emergency health stabilization kiosks and oxygen reserves.', 420000.00, 420000.00, 420000.00, 'Community Health Centers', 'COMPLETED')
         ON CONFLICT (id) DO NOTHING`,
        [ngoId]
      );
    });

    console.log('✅ Demo data successfully seeded for VERA Phase 5!');
    console.log('--------------------------------------------------');
    console.log('Demo Campaign: Government School Classroom — Jaipur');
    console.log('  Target:   ₹10,00,000');
    console.log('  Raised:   ₹7,50,000');
    console.log('  Locked:   ₹4,65,000');
    console.log('  Released: ₹2,85,000');
    console.log('--------------------------------------------------');
    console.log('Demo Credentials (Password: Password123!):');
    console.log('  NGO:     ngo@fundtrail.org / ngo@vera.org');
    console.log('  DONOR:   donor@fundtrail.org / donor@vera.org');
    console.log('  AUDITOR: auditor@fundtrail.org / auditor@vera.org');
    console.log('  ADMIN:   admin@fundtrail.org / admin@vera.org');
    console.log('--------------------------------------------------');
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

seedDatabase();
