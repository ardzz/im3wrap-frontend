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
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { usePackagesStore } from '@/lib/store/packages-store';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { isIM3Linked, profile, isLoading: im3Loading, refreshProfile } = useIM3();
  const { transactions, loadTransactions, isLoadingTransactions } = usePackagesStore();

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const formatBalance = (balance: number | undefined | null) => {
    if (typeof balance !== 'number' || isNaN(balance)) {
      return 'N/A';
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(balance);
  };

  const formatCompactBalance = (balance: number | undefined | null) => {
    if (typeof balance !== 'number' || isNaN(balance)) {
      return 'N/A';
    }

    if (balance >= 1000000) {
      return `Rp ${(balance / 1000000).toFixed(1)}M`;
    } else if (balance >= 1000) {
      return `Rp ${(balance / 1000).toFixed(0)}K`;
    } else {
      return `Rp ${balance.toLocaleString('id-ID')}`;
    }
  };

  // Calculate stats
  const pendingTransactions = transactions.filter(t => t.status === 'PROCESSING' || t.status === 'PENDING').length;
  const completedTransactions = transactions.filter(t => t.status === 'SUCCESS').length;
  const failedTransactions = transactions.filter(t => t.status === 'FAILED').length;
  const totalSpent = transactions
    .filter(t => t.status === 'SUCCESS')
    .reduce((sum, t) => {
      if (!t.package) return sum;
      const price = t.package.discount_price > 0 ? t.package.discount_price : t.package.normal_price;
      return sum + price;
    }, 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-3 sm:p-4">
                <CardHeader className="px-0 pb-2">
                  <Skeleton className="h-4 w-20" />
                </CardHeader>
                <CardContent className="px-0">
                  <Skeleton className="h-6 w-16 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Welcome Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Welcome back, {user.username}!
            </h1>
            {(isIM3Linked && profile) && (
              <Button
                variant="outline"
                size="sm"
                onClick={refreshProfile}
                disabled={im3Loading}
                className="hidden sm:flex"
              >
                {im3Loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage your IM3 packages and transactions
          </p>
        </div>

        {/* Alert for non-linked IM3 accounts */}
        {!isIM3Linked && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-amber-800 font-medium">IM3 Account Not Linked</p>
                <p className="text-sm text-amber-700">Link your IM3 account to start purchasing packages and view your balance.</p>
              </div>
              <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 flex-shrink-0">
                <Link href="/im3">Link Now</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid - Mobile First */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {/* IM3 Status */}
          <Card className="p-3 sm:p-4 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">IM3 Status</CardTitle>
              <Smartphone className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-0">
              <div className="flex items-start flex-col space-y-1">
                <Badge
                  variant={isIM3Linked ? "default" : "destructive"}
                  className={`text-xs ${isIM3Linked ? "bg-green-100 text-green-800 border-green-200" : ""}`}
                >
                  {isIM3Linked ? "Linked" : "Not Linked"}
                </Badge>
                <p className="text-xs text-gray-500">
                  {isIM3Linked ? "Account connected" : "Click to link"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* IM3 Balance */}
          <Card className="p-3 sm:p-4 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Balance</CardTitle>
              <Wallet className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-0">
              <div className="text-lg sm:text-2xl font-bold text-gray-900 break-all">
                {profile ? (
                  <span className="sm:hidden">{formatCompactBalance(profile.balance)}</span>
                ) : null}
                {profile ? (
                  <span className="hidden sm:inline">{formatBalance(profile.balance)}</span>
                ) : (
                  <span className="text-gray-400">Rp 0</span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {isIM3Linked ? "Current balance" : "Link to view"}
              </p>
            </CardContent>
          </Card>

          {/* Pending Orders */}
          <Card className="p-3 sm:p-4 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-0">
              <div className="text-lg sm:text-2xl font-bold text-gray-900">{pendingTransactions}</div>
              <p className="text-xs text-gray-500">
                {pendingTransactions === 1 ? "Processing" : "Processing"}
              </p>
            </CardContent>
          </Card>

          {/* Total Spent */}
          <Card className="p-3 sm:p-4 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Total Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-0">
              <div className="text-lg sm:text-2xl font-bold text-gray-900">
                <span className="sm:hidden">{formatCompactBalance(totalSpent)}</span>
                <span className="hidden sm:inline">{formatBalance(totalSpent)}</span>
              </div>
              <p className="text-xs text-gray-500">
                {completedTransactions} successful
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Browse Packages */}
          <Card className="hover:shadow-lg transition-all duration-200 group cursor-pointer">
            <Link href="/packages" className="block h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-left text-base sm:text-lg group-hover:text-primary transition-colors">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Package2 className="h-5 w-5 text-blue-600" />
                  </div>
                  Browse Packages
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  Discover and purchase IM3 data packages at great prices.
                </p>
                <div className="flex items-center text-sm text-primary font-medium">
                  Explore packages
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* IM3 Account */}
          <Card className="hover:shadow-lg transition-all duration-200 group cursor-pointer">
            <Link href="/im3" className="block h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-left text-base sm:text-lg group-hover:text-primary transition-colors">
                  <div className={`p-2 rounded-lg transition-colors ${
                    isIM3Linked 
                      ? 'bg-green-100 group-hover:bg-green-200' 
                      : 'bg-orange-100 group-hover:bg-orange-200'
                  }`}>
                    <Smartphone className={`h-5 w-5 ${
                      isIM3Linked ? 'text-green-600' : 'text-orange-600'
                    }`} />
                  </div>
                  IM3 Account
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  {isIM3Linked
                    ? "Manage your linked IM3 account and view details."
                    : "Link your IM3 account to start purchasing packages."
                  }
                </p>
                <div className="flex items-center text-sm text-primary font-medium">
                  {isIM3Linked ? "Manage account" : "Link account"}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Transaction History */}
          <Card className="hover:shadow-lg transition-all duration-200 group cursor-pointer sm:col-span-2 lg:col-span-1">
            <Link href="/transactions" className="block h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-left text-base sm:text-lg group-hover:text-primary transition-colors">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <History className="h-5 w-5 text-purple-600" />
                  </div>
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  View all your package purchases and transaction details.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-primary font-medium">
                    View history
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{transactions.length} total</p>
                    {failedTransactions > 0 && (
                      <p className="text-xs text-red-500">{failedTransactions} failed</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-left text-base sm:text-lg">
                <History className="h-5 w-5 text-gray-600" />
                Recent Transactions
              </CardTitle>
              <div className="flex items-center gap-2">
                {isLoadingTransactions && (
                  <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                )}
                {transactions.length > 3 && (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/transactions">
                      View All
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <TransactionHistory limit={3} showViewAll={false} showHeader={false} />
          </CardContent>
        </Card>

        {/* Profile Overview - Mobile Optimized */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-left text-base sm:text-lg">
                <User className="h-5 w-5 text-gray-600" />
                Profile Overview
              </CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/profile">
                  Edit Profile
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* User Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 text-sm uppercase tracking-wide">Account Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">Username</label>
                    <p className="text-sm sm:text-base text-gray-900">{user.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">Email</label>
                    <p className="text-sm sm:text-base text-gray-900 break-all">{user.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">Phone Number</label>
                    <p className="text-sm sm:text-base text-gray-900">{user.phone_number || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* IM3 Information */}
              {isIM3Linked && profile ? (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 text-sm uppercase tracking-wide">IM3 Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">IM3 Number</label>
                      <p className="text-sm sm:text-base text-gray-900">{profile.mob}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Account Name</label>
                      <p className="text-sm sm:text-base text-gray-900">{profile.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-2">Account Status</label>
                      <Badge
                        variant={profile.status === 'ACTIVE' ? 'default' : 'destructive'}
                        className="bg-green-100 text-green-800 border-green-200"
                      >
                        {profile.status}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Current Balance</label>
                      <p className="text-lg font-semibold text-green-600">{formatBalance(profile.balance)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 text-sm uppercase tracking-wide">IM3 Information</h3>
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">No IM3 account linked</p>
                    <Button asChild size="sm">
                      <Link href="/im3">Link IM3 Account</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}