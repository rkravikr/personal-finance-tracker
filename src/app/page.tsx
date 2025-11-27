import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownIcon, ArrowUpIcon, DollarSign, AlertTriangle, Plus } from 'lucide-react';
import { OverviewChart } from '@/components/OverviewChart';
import { CategoryPieChart } from '@/components/CategoryPieChart';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { DateFilter } from '@/components/DateFilter';
import { AddTransactionDialog } from '@/components/AddTransactionDialog';
import { Button } from '@/components/ui/button';
import { RecurringTransactions } from '@/components/RecurringTransactions';
import { BudgetProgress } from '@/components/BudgetProgress';
import { TrendLineChart } from '@/components/TrendLineChart';
import { SearchBar } from '@/components/SearchBar';
import { CollapsibleCard } from '@/components/CollapsibleCard';
import { FinancialGoals } from '@/components/FinancialGoals';
import { Money } from '@/components/Money';
import { WalletManager } from '@/components/WalletManager';

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const session = await getServerSession(authOptions);
  const resolvedSearchParams = await searchParams;

  if (!session || !session.user) {
    redirect('/login');
  }

  // @ts-ignore
  const userId = session.user.id;

  // Process recurring transactions
  db.processRecurringTransactions(userId);

  let transactions = db.getTransactions(userId);
  const categories = db.getCategories(userId);

  // Search Filtering
  const query = resolvedSearchParams.query as string | undefined;
  if (query) {
    const lowerQuery = query.toLowerCase();
    transactions = transactions.filter(t =>
      t.description.toLowerCase().includes(lowerQuery) ||
      t.amount.toString().includes(lowerQuery) ||
      categories.find(c => c.id === t.categoryId)?.name.toLowerCase().includes(lowerQuery)
    );
  }

  // Date Filtering
  const dateRange = resolvedSearchParams.dateRange as string | undefined;
  if (dateRange && dateRange !== 'all') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    transactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      switch (dateRange) {
        case 'today':
          return tDate >= today;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return tDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return tDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(today);
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          return tDate >= yearAgo;
        default:
          return true;
      }
    });
  }

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = income - expenses;

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const monthlyExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      const month = new Date(t.date).toLocaleString('default', { month: 'short' });
      const existing = acc.find((item) => item.name === month);
      if (existing) {
        existing.total += t.amount;
      } else {
        acc.push({ name: month, total: t.amount });
      }
      return acc;
    }, [] as { name: string; total: number }[])
    .sort((a, b) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(a.name) - months.indexOf(b.name);
    });

  const categoryExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      const category = categories.find(c => c.id === t.categoryId);
      const categoryName = category ? category.name : 'Unknown';
      const existing = acc.find((item) => item.name === categoryName);
      if (existing) {
        existing.value += t.amount;
      } else {
        acc.push({ name: categoryName, value: t.amount, color: '' });
      }
      return acc;
    }, [] as { name: string; value: number; color: string }[]);

  const budgetData = categories
    .filter(c => c.type === 'expense' && c.budget)
    .map(c => {
      const totalSpent = transactions
        .filter(t => t.categoryId === c.id)
        .reduce((acc, t) => acc + t.amount, 0);
      return {
        category: c.name,
        budget: c.budget || 0,
        spent: totalSpent,
        percentage: ((totalSpent / (c.budget || 1)) * 100)
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  const trendData = transactions
    .filter(t => t.type === 'expense')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((acc, t) => {
      const date = new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.amount += t.amount;
      } else {
        acc.push({ date, amount: t.amount });
      }
      return acc;
    }, [] as { date: string; amount: number }[])
    .slice(-30);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <SearchBar />
          <DateFilter />
          <WalletManager />
          <AddTransactionDialog />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-3 space-y-4">
          <BudgetProgress budgets={budgetData} />
        </div>
        <Card className="glass-card border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"><Money amount={balance} /></div>
          </CardContent>
        </Card>
        <Card className="glass-card border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">+<Money amount={income} /></div>
          </CardContent>
        </Card>
        <Card className="glass-card border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500">-<Money amount={expenses} /></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 glass-card border-none">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={monthlyExpenses} />
          </CardContent>
        </Card>
        <div className="col-span-3 space-y-4">
          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle>Expense Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryPieChart data={categoryExpenses} />
            </CardContent>
          </Card>
          <RecurringTransactions />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-7">
          <FinancialGoals />
        </div>
        <CollapsibleCard title="Spending Trend (Last 30 Days)" className="col-span-7" defaultOpen={false}>
          <div className="pl-2">
            <TrendLineChart data={trendData} />
          </div>
        </CollapsibleCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <CollapsibleCard title="Recent Transactions" className="col-span-7">
          <div className="space-y-8">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center p-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
                <div className={`ml-auto font-medium ${transaction.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {transaction.type === 'income' ? '+' : '-'}<Money amount={transaction.amount} />
                </div>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <div className="text-center text-sm text-muted-foreground">
                No transactions found for this period.
              </div>
            )}
          </div>
        </CollapsibleCard>
      </div>
    </div>
  );
}
