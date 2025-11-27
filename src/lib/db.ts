import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data.json');

export interface User {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    phone?: string;
    photoUrl?: string;
    recoveryEmail?: string;
    loginHistory?: { date: string; ip: string; device: string }[];
    createdAt: string;
}

export interface Transaction {
    id: string;
    userId: string;
    amount: number;
    description: string;
    date: string;
    type: 'income' | 'expense';
    categoryId: string;
    walletId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    id: string;
    userId: string; // Categories can be user-specific or global (if userId is null/system)
    name: string;
    type: 'income' | 'expense';
    budget?: number;
    createdAt: string;
    updatedAt: string;
}

export interface RecurringTransaction {
    id: string;
    userId: string;
    amount: number;
    description: string;
    type: 'income' | 'expense';
    categoryId: string;
    dayOfMonth: number;
    lastGenerated: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Goal {
    id: string;
    userId: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
    color: string;
    createdAt: string;
    updatedAt: string;
}

export interface Wallet {
    id: string;
    userId: string;
    name: string;
    type: 'cash' | 'bank' | 'credit' | 'wallet';
    initialBalance: number;
    color: string;
    createdAt: string;
    updatedAt: string;
}

interface Database {
    users: User[];
    transactions: Transaction[];
    categories: Category[];
    recurringTransactions: RecurringTransaction[];
    goals: Goal[];
    wallets: Wallet[];
}

const defaultData: Database = {
    users: [],
    transactions: [],
    categories: [],
    recurringTransactions: [],
    goals: [],
    wallets: [],
};

const defaultCategories = [
    { name: 'Salary', type: 'income' },
    { name: 'Freelance', type: 'income' },
    { name: 'Investments', type: 'income' },
    { name: 'Groceries', type: 'expense', budget: 500 },
    { name: 'Rent', type: 'expense', budget: 1200 },
    { name: 'Utilities', type: 'expense', budget: 200 },
    { name: 'Entertainment', type: 'expense', budget: 150 },
    { name: 'Transport', type: 'expense', budget: 100 },
    { name: 'Health', type: 'expense', budget: 100 },
    { name: 'Shopping', type: 'expense', budget: 200 },
];

function readDb(): Database {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        return {
            users: parsed.users || [],
            transactions: parsed.transactions || [],
            categories: parsed.categories || [],
            recurringTransactions: parsed.recurringTransactions || [],
            goals: parsed.goals || [],
            wallets: parsed.wallets || []
        };
    } catch (error) {
        console.error('Error reading database:', error);
        return defaultData;
    }
}

function writeDb(data: Database) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export const db = {
    // User methods
    createUser: (user: Omit<User, 'id' | 'createdAt'>) => {
        const data = readDb();
        const newUser: User = {
            ...user,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
        };
        data.users.push(newUser);

        // Initialize default categories for the user
        const newCategories = defaultCategories.map(c => ({
            id: Math.random().toString(36).substr(2, 9),
            userId: newUser.id,
            name: c.name,
            type: c.type as 'income' | 'expense',
            budget: c.budget,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }));
        data.categories.push(...newCategories);

        writeDb(data);
        return newUser;
    },
    getUserByEmail: (email: string) => {
        const data = readDb();
        return data.users.find((u) => u.email === email);
    },
    getUserById: (id: string) => {
        const data = readDb();
        return data.users.find((u) => u.id === id);
    },
    updateUser: (id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>) => {
        const data = readDb();
        const index = data.users.findIndex((u) => u.id === id);
        if (index !== -1) {
            data.users[index] = { ...data.users[index], ...updates };
            writeDb(data);
            return data.users[index];
        }
        return null;
    },

    // Transaction methods
    getTransactions: (userId: string) => {
        return readDb().transactions.filter(t => t.userId === userId);
    },
    addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
        const data = readDb();
        const newTransaction: Transaction = {
            ...transaction,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        data.transactions.push(newTransaction);
        writeDb(data);
        return newTransaction;
    },
    addTransactions: (transactions: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[]) => {
        const data = readDb();
        const newTransactions = transactions.map(t => ({
            ...t,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }));
        data.transactions.push(...newTransactions);
        writeDb(data);
        return newTransactions;
    },
    updateTransaction: (userId: string, id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>) => {
        const data = readDb();
        const index = data.transactions.findIndex((t) => t.id === id && t.userId === userId);
        if (index !== -1) {
            data.transactions[index] = {
                ...data.transactions[index],
                ...updates,
                updatedAt: new Date().toISOString(),
            };
            writeDb(data);
            return data.transactions[index];
        }
        return null;
    },
    deleteTransaction: (userId: string, id: string) => {
        const data = readDb();
        data.transactions = data.transactions.filter((t) => !(t.id === id && t.userId === userId));
        writeDb(data);
    },

    // Category methods
    getCategories: (userId: string) => {
        return readDb().categories.filter(c => c.userId === userId);
    },
    createCategory: (userId: string, category: Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
        const data = readDb();
        const newCategory: Category = {
            ...category,
            id: Math.random().toString(36).substr(2, 9),
            userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        data.categories.push(newCategory);
        writeDb(data);
        return newCategory;
    },
    updateCategory: (userId: string, id: string, updates: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>) => {
        const data = readDb();
        const index = data.categories.findIndex((c) => c.id === id && c.userId === userId);
        if (index !== -1) {
            data.categories[index] = {
                ...data.categories[index],
                ...updates,
                updatedAt: new Date().toISOString(),
            };
            writeDb(data);
            return data.categories[index];
        }
        return null;
    },

    // Recurring Transaction methods
    getRecurringTransactions: (userId: string) => {
        return readDb().recurringTransactions.filter(t => t.userId === userId);
    },
    createRecurringTransaction: (userId: string, transaction: Omit<RecurringTransaction, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'lastGenerated'>) => {
        const data = readDb();
        const newTransaction: RecurringTransaction = {
            ...transaction,
            id: Math.random().toString(36).substr(2, 9),
            userId,
            lastGenerated: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        data.recurringTransactions.push(newTransaction);
        writeDb(data);
        return newTransaction;
    },
    deleteRecurringTransaction: (userId: string, id: string) => {
        const data = readDb();
        data.recurringTransactions = data.recurringTransactions.filter((t) => !(t.id === id && t.userId === userId));
        writeDb(data);
    },
    processRecurringTransactions: (userId: string) => {
        const data = readDb();
        const userRecurring = data.recurringTransactions.filter(t => t.userId === userId);
        const now = new Date();
        const currentDay = now.getDate();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        let changesMade = false;

        userRecurring.forEach(rt => {
            let shouldGenerate = false;

            if (!rt.lastGenerated) {
                if (currentDay >= rt.dayOfMonth) {
                    shouldGenerate = true;
                }
            } else {
                const lastGenDate = new Date(rt.lastGenerated);
                if (lastGenDate.getMonth() !== currentMonth || lastGenDate.getFullYear() !== currentYear) {
                    if (currentDay >= rt.dayOfMonth) {
                        shouldGenerate = true;
                    }
                }
            }

            if (shouldGenerate) {
                const newTransaction: Transaction = {
                    id: Math.random().toString(36).substr(2, 9),
                    userId: rt.userId,
                    amount: rt.amount,
                    description: rt.description,
                    date: now.toISOString(),
                    type: rt.type,
                    categoryId: rt.categoryId,
                    createdAt: now.toISOString(),
                    updatedAt: now.toISOString(),
                };
                data.transactions.push(newTransaction);
                rt.lastGenerated = now.toISOString();
                changesMade = true;
            }
        });

        if (changesMade) {
            writeDb(data);
        }
    },

    // Goals methods
    getGoals: (userId: string) => {
        const data = readDb();
        return data.goals ? data.goals.filter(g => g.userId === userId) : [];
    },

    createGoal: (goal: Goal) => {
        const data = readDb();
        if (!data.goals) data.goals = [];
        data.goals.push(goal);
        writeDb(data);
        return goal;
    },

    updateGoal: (id: string, updates: Partial<Goal>) => {
        const data = readDb();
        if (!data.goals) return null;
        const index = data.goals.findIndex(g => g.id === id);
        if (index !== -1) {
            data.goals[index] = { ...data.goals[index], ...updates, updatedAt: new Date().toISOString() };
            writeDb(data);
            return data.goals[index];
        }
        return null;
    },

    deleteGoal: (id: string) => {
        const data = readDb();
        if (!data.goals) return;
        data.goals = data.goals.filter(g => g.id !== id);
        writeDb(data);
    },

    // Wallet methods
    getWallets: (userId: string) => {
        const data = readDb();
        return data.wallets ? data.wallets.filter(w => w.userId === userId) : [];
    },

    createWallet: (wallet: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt'>) => {
        const data = readDb();
        if (!data.wallets) data.wallets = [];
        const newWallet: Wallet = {
            ...wallet,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        data.wallets.push(newWallet);
        writeDb(data);
        return newWallet;
    },

    updateWallet: (id: string, updates: Partial<Wallet>) => {
        const data = readDb();
        if (!data.wallets) return null;
        const index = data.wallets.findIndex(w => w.id === id);
        if (index !== -1) {
            data.wallets[index] = { ...data.wallets[index], ...updates, updatedAt: new Date().toISOString() };
            writeDb(data);
            return data.wallets[index];
        }
        return null;
    },

    deleteWallet: (id: string) => {
        const data = readDb();
        if (!data.wallets) return;
        data.wallets = data.wallets.filter(w => w.id !== id);
        writeDb(data);
    }
};
