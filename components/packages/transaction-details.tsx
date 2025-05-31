'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePackagesStore } from '@/lib/store/packages-store';
import { TransactionWithDetails } from '@/lib/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  Calendar,
  Package2,
  CreditCard,
  AlertCircle,
  RefreshCw,
  Copy,
  QrCode
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';

interface TransactionDetailsProps {
  transactionId: number;
}

export function TransactionDetails({ transactionId }: TransactionDetailsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState(0);

  const {
    selectedTransaction,
    isLoadingTransactions,
    error,
    getTransaction,
    clearError,
  } = usePackagesStore();

  // Auto-refresh for processing transactions
  const startAutoRefresh = useCallback(() => {
    if (refreshInterval) return; // Already refreshing

    const interval = setInterval(async () => {
      if (selectedTransaction?.status === 'PROCESSING' || selectedTransaction?.status === 'PENDING') {
        try {
          await getTransaction(transactionId);
        } catch (error) {
          console.error('Auto-refresh failed:', error);
        }
      } else {
        // Stop auto-refresh if transaction is completed
        setRefreshInterval(null);
      }
    }, 3000); // Refresh every 3 seconds

    setRefreshInterval(interval);
  }, [transactionId, selectedTransaction?.status, getTransaction, refreshInterval]);

  const stopAutoRefresh = useCallback(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [refreshInterval]);

  // Load transaction and setup auto-refresh
  useEffect(() => {
    getTransaction(transactionId);
  }, [transactionId, getTransaction]);

  // Setup auto-refresh for processing transactions
  useEffect(() => {
    if (selectedTransaction?.status === 'PROCESSING' || selectedTransaction?.status === 'PENDING') {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }

    return () => stopAutoRefresh();
  }, [selectedTransaction?.status, startAutoRefresh, stopAutoRefresh]);

  // Progress simulation for processing transactions
  useEffect(() => {
    if (selectedTransaction?.status === 'PROCESSING') {
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev; // Don't go to 100% until actually complete
          return prev + Math.random() * 10;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else if (selectedTransaction?.status === 'SUCCESS') {
      setProgress(100);
    } else {
      setProgress(0);
    }
  }, [selectedTransaction?.status]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await getTransaction(transactionId);
      toast.success('Transaction updated');
    } catch (error) {
      toast.error('Failed to refresh transaction');
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'FAILED':
        return <XCircle className="h-6 w-6 text-red-600" />;
      case 'PROCESSING':
        return <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />;
      case 'PENDING':
      default:
        return <Clock className="h-6 w-6 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge variant="default" className="bg-green-100 text-green-800 text-sm">Completed</Badge>;
      case 'FAILED':
        return <Badge variant="destructive" className="text-sm">Failed</Badge>;
      case 'PROCESSING':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 text-sm">Processing</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="secondary" className="text-sm">Pending</Badge>;
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'Your package has been successfully activated and is ready to use.';
      case 'FAILED':
        return 'The transaction failed. Please try again or contact support.';
      case 'PROCESSING':
        return 'Your transaction is being processed. This usually takes 1-3 minutes.';
      case 'PENDING':
      default:
        return 'Your transaction is pending and will be processed shortly.';
    }
  };

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const parseDate = (dateString: string) => {
    try {
      if (dateString.includes('T') && dateString.includes('Z')) {
        return new Date(dateString);
      }
      if (dateString.includes('GMT')) {
        return new Date(dateString);
      }
      return new Date(dateString);
    } catch (error) {
      return new Date();
    }
  };

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

  if (isLoadingTransactions && !selectedTransaction) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!selectedTransaction) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Transaction not found. Please check the transaction ID and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const transaction = selectedTransaction;
  const transactionPrice = getTransactionPrice(transaction);
  const hasDiscount = hasTransactionDiscount(transaction);
  const createdDate = parseDate(transaction.created_at);
  const completionDate = transaction.completion_time ? parseDate(transaction.completion_time) : null;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/transactions">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Transaction #{transaction.id}</h1>
            <p className="text-gray-600">
              {format(createdDate, 'EEEE, MMMM dd, yyyy \'at\' HH:mm')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(transaction.status)}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                {getStatusIcon(transaction.status)}
                <div>
                  <CardTitle className="text-xl">
                    {transaction.status === 'SUCCESS' ? 'Transaction Completed' :
                     transaction.status === 'FAILED' ? 'Transaction Failed' :
                     transaction.status === 'PROCESSING' ? 'Transaction Processing' :
                     'Transaction Pending'}
                  </CardTitle>
                  <CardDescription>
                    {getStatusDescription(transaction.status)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {transaction.status === 'PROCESSING' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-gray-500">
                    This process usually takes 1-3 minutes. The page will update automatically.
                  </p>
                </div>
              )}

              {transaction.status === 'FAILED' && transaction.error_message && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Error:</strong> {transaction.error_message}
                  </AlertDescription>
                </Alert>
              )}

              {transaction.status === 'SUCCESS' && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your package has been successfully activated. You can start using it immediately.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Package Details */}
          {transaction.package && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package2 className="h-5 w-5" />
                  Package Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{transaction.package.package_name}</h3>
                  <p className="text-gray-600">Keyword: {transaction.package.keyword}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Package Code</label>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                        {transaction.package.pvr_code}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(transaction.package!.pvr_code, 'Package code')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Activation Keyword</label>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                        {transaction.package.keyword}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(transaction.package!.keyword, 'Keyword')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Manual Activation</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    If the package wasn't automatically activated, you can activate it manually:
                  </p>
                  <ol className="text-sm text-gray-600 space-y-1">
                    <li>1. Open your phone's SMS app</li>
                    <li>2. Send "{transaction.package.keyword}" to 3636</li>
                    <li>3. Wait for confirmation SMS</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          )}

          {/* QR Code */}
          {transaction.qr_code && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Payment QR Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <img
                    src={transaction.qr_code}
                    alt="Payment QR Code"
                    className="max-w-xs border rounded-lg"
                  />
                </div>
                <p className="text-sm text-gray-500 text-center mt-2">
                  Scan this QR code with your payment app
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Transaction Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Transaction Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID</span>
                <span className="font-mono">#{transaction.id}</span>
              </div>

              {transaction.reference_id && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference ID</span>
                  <span className="font-mono text-sm">{transaction.reference_id}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                {getStatusBadge(transaction.status)}
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Package Price</span>
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    {formatPrice(transactionPrice)}
                  </div>
                  {hasDiscount && (
                    <div className="text-sm text-gray-400 line-through">
                      {formatPrice(transaction.package!.normal_price)}
                    </div>
                  )}
                </div>
              </div>

              {hasDiscount && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600 font-medium">
                    -{formatPrice(transaction.package!.normal_price - transactionPrice)}
                  </span>
                </div>
              )}

              <hr />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total Paid</span>
                <span className="text-green-600">{formatPrice(transactionPrice)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Transaction Created</p>
                  <p className="text-sm text-gray-600">
                    {format(createdDate, 'MMM dd, yyyy HH:mm')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(createdDate, { addSuffix: true })}
                  </p>
                </div>
              </div>

              {transaction.status === 'PROCESSING' && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />
                  </div>
                  <div>
                    <p className="font-medium">Processing</p>
                    <p className="text-sm text-gray-600">In progress...</p>
                  </div>
                </div>
              )}

              {completionDate && (
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    transaction.status === 'SUCCESS' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.status === 'SUCCESS' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {transaction.status === 'SUCCESS' ? 'Completed' : 'Failed'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(completionDate, 'MMM dd, yyyy HH:mm')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(completionDate, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/packages">
                  <Package2 className="mr-2 h-4 w-4" />
                  Browse More Packages
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/transactions">
                  <Clock className="mr-2 h-4 w-4" />
                  View All Transactions
                </Link>
              </Button>

              {transaction.status === 'FAILED' && transaction.package && (
                <Button asChild className="w-full">
                  <Link href={`/packages?retry=${transaction.package.id}`}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}