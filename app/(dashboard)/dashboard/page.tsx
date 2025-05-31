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

      {/* Quick Stats with improved spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">IM3 Status</CardTitle>
            <Smartphone className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex items-center gap-2">
              <Badge variant={isIM3Linked ? "default" : "destructive"} className={isIM3Linked ? "bg-green-100 text-green-800" : ""}>
                {isIM3Linked ? "Linked" : "Not Linked"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {isIM3Linked ? "Account connected" : "Link your account"}
            </p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">IM3 Balance</CardTitle>
            <Wallet className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold">
              {profile ? formatBalance(profile.balance) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isIM3Linked ? "Current balance" : "Link account to view"}
            </p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold">{pendingTransactions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently processing
            </p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold">Rp {totalSpent.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time purchases
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions with better spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-all duration-200 p-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package2 className="h-6 w-6 text-primary" />
              </div>
              Browse Packages
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-gray-600 mb-6 leading-relaxed">
              Discover and purchase IM3 data packages at great prices.
            </p>
            <Button asChild className="w-full" size="lg">
              <Link href="/packages">
                View Packages
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 p-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              IM3 Account
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-gray-600 mb-6 leading-relaxed">
              {isIM3Linked
                ? "Manage your linked IM3 account and view details."
                : "Link your IM3 account to start purchasing packages."
              }
            </p>
            <Button asChild variant={isIM3Linked ? "outline" : "default"} className="w-full" size="lg">
              <Link href="/im3">
                {isIM3Linked ? "Manage Account" : "Link Account"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 p-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <History className="h-6 w-6 text-primary" />
              </div>
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-gray-600 mb-6 leading-relaxed">
              View all your package purchases and transaction details.
            </p>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/transactions">
                View History
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions with better spacing */}
      <Card className="p-6">
        <CardContent className="p-0">
          <TransactionHistory limit={3} showViewAll={false} />
        </CardContent>
      </Card>

      {/* Profile Overview with better spacing */}
      <Card className="p-6">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-6 w-6 text-primary" />
            </div>
            Profile Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Username</label>
                <p className="text-base mt-1">{user.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email</label>
                <p className="text-base mt-1">{user.email || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Phone Number</label>
                <p className="text-base mt-1">{user.phone_number || 'Not provided'}</p>
              </div>
            </div>

            {isIM3Linked && profile && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">IM3 Number</label>
                  <p className="text-base mt-1">{profile.mob}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">IM3 Name</label>
                  <p className="text-base mt-1">{profile.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Account Status</label>
                  <div className="mt-1">
                    <Badge variant={profile.status === 'ACTIVE' ? 'default' : 'destructive'}>
                      {profile.status}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8">
            <Button asChild variant="outline" size="lg">
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