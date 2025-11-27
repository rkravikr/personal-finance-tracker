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
    const categories = db.getCategories(userId);
    return NextResponse.json(categories);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // @ts-ignore
    const userId = session.user.id;
    const data = await req.json();

    const category = db.createCategory(userId, {
        name: data.name,
        type: data.type,
        budget: data.budget ? parseFloat(data.budget) : undefined,
    });

    return NextResponse.json(category);
}
