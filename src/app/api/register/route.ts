import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import * as z from 'zod';

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password } = registerSchema.parse(body);

        const existingUser = db.getUserByEmail(email);
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = db.createUser({
            name,
            email,
            passwordHash,
        });

        return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        if (error instanceof z.ZodError) {
            // @ts-ignore
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
