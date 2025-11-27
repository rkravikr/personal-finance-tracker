import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { db, Goal } from '@/lib/db';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // @ts-ignore
    const goals = db.getGoals(session.user.id);
    return NextResponse.json(goals);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { name, targetAmount, deadline, color } = body;

    if (!name || !targetAmount) {
        return new NextResponse('Missing required fields', { status: 400 });
    }

    const newGoal: Goal = {
        id: Math.random().toString(36).substr(2, 9),
        // @ts-ignore
        userId: session.user.id,
        name,
        targetAmount: Number(targetAmount),
        currentAmount: 0,
        deadline,
        color: color || '#3b82f6', // Default blue
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    db.createGoal(newGoal);
    return NextResponse.json(newGoal);
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { id, currentAmount, ...updates } = body;

    if (!id) {
        return new NextResponse('Missing ID', { status: 400 });
    }

    // Verify ownership
    // @ts-ignore
    const goals = db.getGoals(session.user.id);
    const goal = goals.find((g) => g.id === id);

    if (!goal) {
        return new NextResponse('Goal not found', { status: 404 });
    }

    const updatedGoal = db.updateGoal(id, {
        ...updates,
        currentAmount: currentAmount !== undefined ? Number(currentAmount) : goal.currentAmount
    });

    return NextResponse.json(updatedGoal);
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return new NextResponse('Missing ID', { status: 400 });
    }

    // Verify ownership
    // @ts-ignore
    const goals = db.getGoals(session.user.id);
    const goal = goals.find((g) => g.id === id);

    if (!goal) {
        return new NextResponse('Goal not found', { status: 404 });
    }

    db.deleteGoal(id);
    return new NextResponse('Goal deleted', { status: 200 });
}
