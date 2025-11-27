'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, Receipt, LogOut, User, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CurrencySelector } from '@/components/CurrencySelector';

export function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
                <div className="flex items-center">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="hidden font-extrabold text-2xl sm:inline-block">FinanceTracker</span>
                    </Link>
                    {session && (
                        <nav className="flex items-center space-x-6 text-sm font-medium">
                            <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2">
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </Link>
                            <Link href="/transactions" className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2">
                                <Receipt className="h-4 w-4" />
                                Transactions
                            </Link>
                            <Link href="/categories" className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2">
                                <List className="h-4 w-4" />
                                Categories
                            </Link>
                        </nav>
                    )}
                </div>
                <div className="flex items-center space-x-4">
                    {session ? (
                        <div className="flex items-center gap-4">
                            <CurrencySelector />
                            <ThemeToggle />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                                            <AvatarFallback>{session.user?.name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {session.user?.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings" className="cursor-pointer">
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Settings</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => signOut()}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <Link href="/login">
                                <Button variant="ghost">Login</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
