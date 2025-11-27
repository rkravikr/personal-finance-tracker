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
    const transactions = db.getTransactions(userId);
    return NextResponse.json(transactions);
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // @ts-ignore
    const userId = session.user.id;

    const body = await request.json();
    const { amount, description, date, type, categoryId } = body;

    if (!amount || !description || !date || !type || !categoryId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newTransaction = db.addTransaction({
        userId,
        amount: parseFloat(amount),
        description,
        date,
        type,
        categoryId,
    });

    // Check for budget overflow
    let isOverBudget = false;
    let categoryName = '';
    if (type === 'expense') {
        const category = db.getCategories(userId).find(c => c.id === categoryId);
        if (category && category.budget) {
            const transactions = db.getTransactions(userId);
            const totalSpent = transactions
                .filter(t => t.categoryId === categoryId)
                .reduce((acc, t) => acc + t.amount, 0);

            if (totalSpent > category.budget) {
                isOverBudget = true;
                categoryName = category.name;
            }
        }
    }

    return NextResponse.json({ ...newTransaction, isOverBudget, categoryName });
}
