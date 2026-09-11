-- db/seed.sql
-- Seed data for development/demo environment
-- Default password for demo users is: Password123!
-- Hashed using bcryptjs with 10 rounds: $2a$10$N.R44a0jV77/l2N1x9O7ee7T5.uWz/Nq38fM1YVzQxG96bZzT8.4G

INSERT INTO users (id, name, email, password_hash, role)
VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    'Care India Foundation',
    'ngo@fundtrail.org',
    '$2a$10$7Z605o9iR83rGtzC1M1sP.j4j0y0aE8v7kM4fVzP4L0U.Zc8u09dK',
    'NGO'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Aarav Sharma',
    'donor@fundtrail.org',
    '$2a$10$7Z605o9iR83rGtzC1M1sP.j4j0y0aE8v7kM4fVzP4L0U.Zc8u09dK',
    'DONOR'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Priya Mehta (Auditor)',
    'auditor@fundtrail.org',
    '$2a$10$7Z605o9iR83rGtzC1M1sP.j4j0y0aE8v7kM4fVzP4L0U.Zc8u09dK',
    'AUDITOR'
  )
ON CONFLICT (email) DO NOTHING;

INSERT INTO campaigns (id, ngo_id, title, description, target_amount, raised_amount, released_amount, beneficiary, status)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'Clean Water & Sanitation for Rajasthan Schools',
    'Providing sustainable solar-powered clean drinking water filtration systems and sanitation facilities to 12 government primary schools across rural Jaipur district.',
    850000.00,
    0.00,
    0.00,
    'Rural Primary School Students (1,400+ children)',
    'ACTIVE'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    'Emergency Medical Supplies & First-Aid Kiosks',
    'Setting up 5 emergency health stabilization kiosks and oxygen reserves in remote tribal villages.',
    420000.00,
    0.00,
    0.00,
    'Tribal Village Community Health Centers',
    'DRAFT'
  )
ON CONFLICT (id) DO NOTHING;
