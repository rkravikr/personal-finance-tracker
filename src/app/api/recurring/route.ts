import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // @ts-ignore
    const userId = session.user.id;
    const transactions = db.getRecurringTransactions(userId);
    return NextResponse.json(transactions);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // @ts-ignore
    const userId = session.user.id;
    const data = await req.json();

    const transaction = db.createRecurringTransaction(userId, {
        amount: parseFloat(data.amount),
        description: data.description,
        type: data.type,
        categoryId: data.categoryId,
        dayOfMonth: parseInt(data.dayOfMonth),
    });

    return NextResponse.json(transaction);
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // @ts-ignore
    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    db.deleteRecurringTransaction(userId, id);
    return NextResponse.json({ success: true });
}
