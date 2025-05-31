'use client';

import { TransactionHistory } from '@/components/packages/transaction-history';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { History, Package2, ArrowLeft, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { usePackagesStore } from '@/lib/store/packages-store';
import { useEffect } from 'react';
import Link from 'next/link';

export default function TransactionsPage() {
  const { transactions, loadTransactions } = usePackagesStore();

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Calculate stats
  const totalTransactions = transactions.length;
  const successfulTransactions = transactions.filter(t => t.status === 'SUCCESS').length;
  const failedTransactions = transactions.filter(t => t.status === 'FAILED').length;
  const processingTransactions = transactions.filter(t => t.status === 'PROCESSING' || t.status === 'PENDING').length;

  const totalSpent = transactions
    .filter(t => t.status === 'SUCCESS')
    .reduce((sum, t) => {
      if (!t.package) return sum;
      const price = t.package.discount_price > 0 ? t.package.discount_price : t.package.normal_price;
      return sum + price;
    }, 0);

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <History className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Transaction History</h1>
            <p className="text-gray-600">View and manage your package purchases</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button asChild>
            <Link href="/packages">
              <Package2 className="mr-2 h-4 w-4" />
              Browse Packages
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              All time purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successfulTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Completed purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{processingTransactions}</div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalSpent)}</div>
            <p className="text-xs text-muted-foreground">
              Successful purchases only
            </p>
          </CardContent>
        </Card>
      </div>

      {processingTransactions > 0 && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            You have {processingTransactions} transaction(s) currently being processed.
            They will update automatically once completed.
          </AlertDescription>
        </Alert>
      )}

      <TransactionHistory showViewAll={false} />
    </div>
  );
}