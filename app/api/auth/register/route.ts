// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { ApiError, parseBody, withErrorHandling } from '@/lib/api';

export const dynamic = 'force-dynamic';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.email('Enter a valid email address').transform((value) => value.toLowerCase().trim()),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export const POST = withErrorHandling('auth:register', async (req: NextRequest) => {
  const { name, email, password } = await parseBody(req, registerSchema);

  await connectDB();

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  // Cost factor 12: ~250 ms per hash on typical hardware — slow enough to make
  // offline cracking expensive, fast enough for an interactive signup.
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({ name, email, password: hashedPassword });

  // The password hash is never echoed back, not even to the account owner.
  return NextResponse.json(
    {
      message: 'Account created successfully',
      user: { id: user._id.toString(), name: user.name, email: user.email },
    },
    { status: 201 }
  );
});
