import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, signSessionToken, setSessionCookie } from '@/lib/auth';
import { registerSchema } from '@/lib/validation';
import { User } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, role } = validated.data;

    // Check if email already registered
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rowCount && existing.rowCount > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const insertRes = await query<User>(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, wallet_address, role, created_at, updated_at`,
      [name, email.toLowerCase(), passwordHash, role]
    );

    const user = insertRes.rows[0];

    // Create session token and set cookie
    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    setSessionCookie(token);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error during registration' },
      { status: 500 }
    );
  }
}
