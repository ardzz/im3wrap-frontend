'use client';

import { useEffect, useState } from 'react';
import { usePackagesStore } from '@/lib/store/packages-store';
import { TransactionWithDetails } from '@/lib/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  History,
  Package2,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  RefreshCw,
  Calendar,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import Link from 'next/link';

interface TransactionHistoryProps {
  limit?: number;
  showViewAll?: boolean;
}

export function TransactionHistory({ limit, showViewAll = true }: TransactionHistoryProps) {
  const {
    transactions,
    isLoadingTransactions,
    error,
    loadTransactions,
    clearError,
  } = usePackagesStore();

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'PROCESSING':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'PENDING':
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      case 'PROCESSING':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  // Handle different date formats from API
  const parseDate = (dateString: string) => {
    try {
      // Try parsing as ISO first
      if (dateString.includes('T') && dateString.includes('Z')) {
        return parseISO(dateString);
      }

      // Handle GMT format like "Tue, 28 Jan 2025 14:30:30 GMT"
      if (dateString.includes('GMT')) {
        return new Date(dateString);
      }

      // Fallback to standard Date parsing
      return new Date(dateString);
    } catch (error) {
      console.warn('Failed to parse date:', dateString);
      return new Date();
    }
  };

  // Fixed price logic for transactions
  const getTransactionPrice = (transaction: TransactionWithDetails) => {
    if (!transaction.package) return 0;
    return transaction.package.discount_price > 0
      ? transaction.package.discount_price
      : transaction.package.normal_price;
  };

  const hasTransactionDiscount = (transaction: TransactionWithDetails) => {
    if (!transaction.package) return false;
    return transaction.package.discount_price > 0 &&
           transaction.package.discount_price < transaction.package.normal_price;
  };

  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  if (isLoadingTransactions) {
    return (
      <div className="space-y-4">
        {Array.from({ length: limit || 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Transaction History</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadTransactions()}
            disabled={isLoadingTransactions}
          >
            {isLoadingTransactions ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          {showViewAll && limit && transactions.length > limit && (
            <Button asChild size="sm">
              <Link href="/transactions">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {displayTransactions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-500 mb-4">
              You haven't made any package purchases yet.
            </p>
            <Button asChild>
              <Link href="/packages">
                <Package2 className="mr-2 h-4 w-4" />
                Browse Packages
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayTransactions.map((transaction) => {
            const transactionPrice = getTransactionPrice(transaction);
            const hasDiscount = hasTransactionDiscount(transaction);
            const createdDate = parseDate(transaction.created_at);

            return (
              <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getStatusIcon(transaction.status)}
                      {transaction.package?.package_name || 'Unknown Package'}
                    </CardTitle>
                    {getStatusBadge(transaction.status)}
                  </div>
                  <CardDescription className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(createdDate, 'MMM dd, yyyy HH:mm')}
                    </span>
                    <span>•</span>
                    <span>ID: #{transaction.id}</span>
                    {transaction.reference_id && (
                      <>
                        <span>•</span>
                        <span>Ref: {transaction.reference_id}</span>
                      </>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      {transaction.package && (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Price:</span>
                            <span className="font-semibold text-green-600">
                              {formatPrice(transactionPrice)}
                            </span>
                            {hasDiscount && (
                              <span className="text-sm text-gray-400 line-through">
                                {formatPrice(transaction.package.normal_price)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Keyword:</span>
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {transaction.package.keyword}
                            </code>
                          </div>
                        </>
                      )}
                      {transaction.status === 'FAILED' && transaction.error_message && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-red-500">Error:</span>
                          <span className="text-sm text-red-600">{transaction.error_message}</span>
                        </div>
                      )}
                      {transaction.completion_time && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Completed:</span>
                          <span className="text-sm">
                            {formatDistanceToNow(parseDate(transaction.completion_time), { addSuffix: true })}
                          </span>
                        </div>
                      )}
                    </div>

                    <Button asChild variant="outline" size="sm">
                      <Link href={`/transactions/${transaction.id}`}>
                        <Eye className="mr-1 h-4 w-4" />
                        Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}