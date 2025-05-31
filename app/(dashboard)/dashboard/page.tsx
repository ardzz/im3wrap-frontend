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
      <div className="container mx-auto py-8">
        <div className="space-y-6">
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
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.username}!</h1>
          <p className="text-gray-600">Manage your IM3 packages and transactions</p>
        </div>
        <Button onClick={logout} variant="outline">
          Logout
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IM3 Status</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={isIM3Linked ? "default" : "destructive"} className={isIM3Linked ? "bg-green-100 text-green-800" : ""}>
                {isIM3Linked ? "Linked" : "Not Linked"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isIM3Linked ? "Account connected" : "Link your account"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IM3 Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {profile ? formatBalance(profile.balance) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {isIM3Linked ? "Current balance" : "Link account to view"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Currently processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">Rp {totalSpent.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground">
              All time purchases
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package2 className="h-5 w-5" />
              Browse Packages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
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

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              IM3 Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
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

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
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
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
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
    </div>
  );
}