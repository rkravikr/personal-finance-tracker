import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // @ts-ignore
    const userId = session.user.id;

    const { id } = await params;
    db.deleteTransaction(userId, id);
    return NextResponse.json({ success: true });
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // @ts-ignore
    const userId = session.user.id;

    const { id } = await params;
    const body = await request.json();
    const { amount, description, type, categoryId } = body;

    const updatedTransaction = db.updateTransaction(userId, id, {
        amount: parseFloat(amount),
        description,
        type,
        categoryId,
    });

    if (!updatedTransaction) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json(updatedTransaction);
}
