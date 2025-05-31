'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { useIM3 } from '@/lib/hooks/use-im3';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Settings, LogOut, Package, Smartphone, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  const { user, logout } = useAuth();
  const { isIM3Linked, profile } = useIM3();

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const formatBalance = (balance: number | undefined | null) => {
    if (typeof balance !== 'number' || isNaN(balance)) {
      return 'N/A';
    }
    return `Rp ${balance.toLocaleString('id-ID')}`;
  };

  const handleLogout = () => {
    logout();
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
    window.location.replace('/login');
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              IM3Wrap
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/packages"
                className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
              >
                <Package className="h-4 w-4" />
                Packages
              </Link>
              <Link
                href="/transactions"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Transactions
              </Link>
              <Link
                href="/im3"
                className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
              >
                <Smartphone className="h-4 w-4" />
                IM3
                {isIM3Linked ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-orange-500" />
                )}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* IM3 Status Badge */}
            <Badge
              variant={isIM3Linked ? "outline" : "destructive"}
              className={isIM3Linked ? "text-green-600 border-green-600" : ""}
            >
              <Smartphone className="h-3 w-3 mr-1" />
              {isIM3Linked ? "IM3 Linked" : "Not Linked"}
            </Badge>

            {/* Balance if IM3 is linked and has valid balance */}
            {isIM3Linked && profile && typeof profile.balance === 'number' && !isNaN(profile.balance) && (
              <Badge variant="secondary">
                {formatBalance(profile.balance)}
              </Badge>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user ? getInitials(user.username) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.username}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || 'No email provided'}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Smartphone className="h-3 w-3" />
                      <span className="text-xs">
                        {isIM3Linked ? 'IM3 Linked' : 'IM3 Not Linked'}
                      </span>
                    </div>
                    {isIM3Linked && profile && (
                      <div className="text-xs text-green-600">
                        Balance: {formatBalance(profile.balance)}
                      </div>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/im3" className="flex items-center">
                    <Smartphone className="mr-2 h-4 w-4" />
                    <span>IM3 Account</span>
                    {!isIM3Linked && (
                      <Badge variant="destructive" className="ml-auto text-xs">
                        Link
                      </Badge>
                    )}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile?tab=security" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}