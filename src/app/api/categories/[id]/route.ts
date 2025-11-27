import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

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
    const { name, budget, type } = body;

    const updatedCategory = db.updateCategory(userId, id, {
        name,
        budget: budget ? parseFloat(budget) : undefined,
        type,
    });

    if (!updatedCategory) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(updatedCategory);
}
