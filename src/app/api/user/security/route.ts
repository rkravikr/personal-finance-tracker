import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = db.getUserByEmail(session.user.email);
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { currentPassword, newPassword, recoveryEmail } = body;

    if (recoveryEmail) {
        db.updateUser(user.id, { recoveryEmail });
        return NextResponse.json({ success: true, message: 'Recovery email updated' });
    }

    if (currentPassword && newPassword) {
        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        db.updateUser(user.id, { passwordHash: hashedPassword });
        return NextResponse.json({ success: true, message: 'Password updated successfully' });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}
