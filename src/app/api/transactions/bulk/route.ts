import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { db } from '@/lib/db';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const body = await req.json();
        const { transactions } = body;

        if (!Array.isArray(transactions) || transactions.length === 0) {
            return new NextResponse('Invalid data', { status: 400 });
        }

        // @ts-ignore
        const userId = session.user.id;
        const categories = db.getCategories(userId);

        // Map and validate transactions
        const validTransactions = transactions.map((t: any) => {
            // Try to find matching category by name, case-insensitive
            const category = categories.find(c => c.name.toLowerCase() === (t.category || '').toLowerCase());

            return {
                userId,
                description: t.description || 'Imported Transaction',
                amount: Number(t.amount) || 0,
                type: (t.type === 'income' || t.type === 'expense') ? t.type : (Number(t.amount) < 0 ? 'expense' : 'income'),
                date: t.date ? new Date(t.date).toISOString() : new Date().toISOString(),
                categoryId: category ? category.id : categories[0]?.id || '', // Fallback to first category
            };
        });

        db.addTransactions(validTransactions);

        return NextResponse.json({ count: validTransactions.length });
    } catch (error) {
        console.error('Bulk import error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
