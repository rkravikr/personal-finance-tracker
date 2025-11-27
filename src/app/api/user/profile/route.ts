import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
    const { name, phone, photoUrl } = body;

    const updatedUser = db.updateUser(user.id, {
        name: name || user.name,
        phone: phone || user.phone,
        photoUrl: photoUrl || user.photoUrl,
    });

    return NextResponse.json(updatedUser);
}
