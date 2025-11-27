import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = db.getUserByEmail(session.user.email);
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const wallets = db.getWallets(user.id);
    return NextResponse.json(wallets);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = db.getUserByEmail(session.user.email);
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { name, type, initialBalance, color } = body;

    if (!name || !type) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const wallet = db.createWallet({
        userId: user.id,
        name,
        type,
        initialBalance: Number(initialBalance) || 0,
        color: color || '#3b82f6',
    });

    return NextResponse.json(wallet);
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = db.getUserByEmail(session.user.email);
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    db.deleteWallet(id);
    return NextResponse.json({ success: true });
}
