'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { useIM3 } from '@/lib/hooks/use-im3';
import { TransactionHistory } from '@/components/packages/transaction-history';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Smartphone,
  Package2,
  History,
  TrendingUp,
  Wallet,
  Clock,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { usePackagesStore } from '@/lib/store/packages-store';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { isIM3Linked, profile } = useIM3();
  const { transactions, loadTransactions } = usePackagesStore();

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const formatBalance = (balance: number | undefined | null) => {
    if (typeof balance !== 'number' || isNaN(balance)) {
      return 'N/A';
    }
    return `Rp ${balance.toLocaleString('id-ID')}`;
  };

  // Calculate stats
  const recentTransactions = transactions.slice(0, 3);
  const pendingTransactions = transactions.filter(t => t.status === 'PROCESSING' || t.status === 'PENDING').length;
  const totalSpent = transactions
    .filter(t => t.status === 'SUCCESS')
    .reduce((sum, t) => {
      if (!t.package) return sum;
      const price = t.package.discount_price > 0 ? t.package.discount_price : t.package.normal_price;
      return sum + price;
    }, 0);

  if (!user) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with better spacing */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.username}!</h1>
          <p className="text-gray-600 text-lg">Manage your IM3 packages and transactions</p>
        </div>
        <Button onClick={logout} variant="outline" size="lg">
          Logout
        </Button>
      </div>

      {/* Quick Stats with fixed alignment */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">IM3 Status</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="flex items-start flex-col space-y-2">
              <Badge variant={isIM3Linked ? "default" : "destructive"} className={isIM3Linked ? "bg-green-100 text-green-800" : ""}>
                {isIM3Linked ? "Linked" : "Not Linked"}
              </Badge>
              <p className="text-xs text-muted-foreground">
                {isIM3Linked ? "Account connected" : "Link your account"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">IM3 Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">
              {profile ? formatBalance(profile.balance) : 'Rp 0'}
            </div>
            <p className="text-xs text-muted-foreground text-left">
              {isIM3Linked ? "Current balance" : "Link account to view"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">{pendingTransactions}</div>
            <p className="text-xs text-muted-foreground text-left">
              Currently processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">Rp {totalSpent.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground text-left">
              All time purchases
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions with fixed alignment */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-left">
              <Package2 className="h-5 w-5 flex-shrink-0" />
              Browse Packages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4 text-left">
              Discover and purchase IM3 data packages at great prices.
            </p>
            <Button asChild className="w-full">
              <Link href="/packages">
                View Packages
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-left">
              <Smartphone className="h-5 w-5 flex-shrink-0" />
              IM3 Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4 text-left">
              {isIM3Linked
                ? "Manage your linked IM3 account and view details."
                : "Link your IM3 account to start purchasing packages."
              }
            </p>
            <Button asChild variant={isIM3Linked ? "outline" : "default"} className="w-full">
              <Link href="/im3">
                {isIM3Linked ? "Manage Account" : "Link Account"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-left">
              <History className="h-5 w-5 flex-shrink-0" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4 text-left">
              View all your package purchases and transaction details.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/transactions">
                View History
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-left">
              <History className="h-5 w-5 flex-shrink-0" />
              Recent Transactions
            </CardTitle>
            {transactions.length > 3 && (
              <Button asChild variant="outline" size="sm">
                <Link href="/transactions">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <TransactionHistory limit={3} showViewAll={false} />
        </CardContent>
      </Card>

      {/* Profile Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-left">
            <User className="h-5 w-5 flex-shrink-0" />
            Profile Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Username</label>
                <p className="text-sm">{user.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm">{user.email || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone Number</label>
                <p className="text-sm">{user.phone_number || 'Not provided'}</p>
              </div>
            </div>

            {isIM3Linked && profile && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">IM3 Number</label>
                  <p className="text-sm">{profile.mob}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">IM3 Name</label>
                  <p className="text-sm">{profile.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Status</label>
                  <Badge variant={profile.status === 'ACTIVE' ? 'default' : 'destructive'}>
                    {profile.status}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4">
            <Button asChild variant="outline">
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}