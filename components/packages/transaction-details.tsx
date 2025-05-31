'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTransactionStatus } from '@/lib/hooks/use-transaction-status';
import { useTransactionNotifications } from '@/lib/hooks/use-transaction-notifications';
import {
  ArrowLeft,
  Package2,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Calendar,
  CreditCard,
  Smartphone,
  RefreshCw,
  AlertCircle,
  History,
  Eye,
  DollarSign,
  MoreHorizontal,
  Printer
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TransactionDetailsProps {
  transactionId: number;
}

export function TransactionDetails({ transactionId }: TransactionDetailsProps) {
  const router = useRouter();
  const { transaction, isPolling, startPolling, stopPolling } = useTransactionStatus(transactionId);

  // Set up notifications for status changes
  useTransactionNotifications(transaction);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'PROCESSING':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'PENDING':
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      case 'PROCESSING':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
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
      console.warn('Failed to parse date:', dateString);
      return new Date();
    }
  };

  const getTransactionPrice = () => {
    if (!transaction?.package) return 0;
    return transaction.package.discount_price > 0
      ? transaction.package.discount_price
      : transaction.package.normal_price;
  };

  const hasDiscount = () => {
    if (!transaction?.package) return false;
    return transaction.package.discount_price > 0;
  };

  const handlePrint = () => {
    window.print();
  };

  if (!transaction) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const transactionPrice = getTransactionPrice();
  const createdDate = parseDate(transaction.created_at);
  const platformFee = 5000;

  return (
    <>
      {/* Enhanced Print Styles */}
      <style jsx global>{`
        @media print {
          /* Reset and hide everything */
          * {
            box-shadow: none !important;
            text-shadow: none !important;
          }
          
          body {
            margin: 0;
            padding: 0;
            background: white !important;
            color: black !important;
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.4;
          }
          
          /* Hide everything except print content */
          body * {
            visibility: hidden;
          }
          
          .print-content, .print-content * {
            visibility: visible;
          }
          
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 210mm; /* A4 width */
            margin: 0;
            padding: 15mm;
            background: white;
            color: black;
          }
          
          /* Hide non-printable elements */
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Prevent page breaks */
          .print-no-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          .print-keep-together {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: block !important;
          }
          
          /* Print header */
          .print-header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
            page-break-after: avoid;
          }
          
          .print-header h1 {
            font-size: 20px;
            font-weight: bold;
            margin: 0 0 5px 0;
          }
          
          .print-header p {
            margin: 2px 0;
            font-size: 11px;
          }
          
          /* Print sections */
          .print-section {
            margin-bottom: 12px;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .print-section h3 {
            font-size: 14px;
            font-weight: bold;
            margin: 0 0 8px 0;
            border-bottom: 1px solid #ccc;
            padding-bottom: 3px;
          }
          
          /* Transaction info table */
          .print-transaction-info {
            width: 100%;
            margin: 10px 0;
            page-break-inside: avoid;
            border-collapse: collapse;
          }
          
          .print-transaction-info td {
            padding: 6px 8px;
            border: 1px solid #ddd;
            vertical-align: top;
          }
          
          .print-transaction-info .label {
            background-color: #f8f9fa;
            font-weight: bold;
            width: 35%;
          }
          
          .print-transaction-info .value {
            width: 65%;
          }
          
          /* Package details */
          .print-package-details {
            margin: 10px 0;
            page-break-inside: avoid;
          }
          
          .print-code-box {
            background-color: #f8f9fa;
            border: 1px solid #ddd;
            padding: 6px;
            font-family: 'Courier New', monospace;
            font-size: 10px;
            margin: 3px 0;
            word-break: break-all;
          }
          
          /* Manual activation steps */
          .print-manual-activation {
            margin: 10px 0;
            padding: 8px;
            border: 1px solid #ddd;
            background-color: #f8f9fa;
            page-break-inside: avoid;
          }
          
          .print-manual-activation h4 {
            font-size: 12px;
            font-weight: bold;
            margin: 0 0 5px 0;
          }
          
          .print-manual-activation ol {
            margin: 5px 0 0 15px;
            padding: 0;
          }
          
          .print-manual-activation li {
            margin: 2px 0;
            font-size: 11px;
          }
          
          /* Footer */
          .print-footer {
            border-top: 1px solid #000;
            padding-top: 8px;
            margin-top: 15px;
            text-align: center;
            font-size: 10px;
            page-break-inside: avoid;
          }
          
          .print-footer p {
            margin: 2px 0;
          }
          
          /* Force new page for complex layouts */
          @page {
            margin: 15mm;
            size: A4;
          }
        }
      `}</style>

      <div className="container mx-auto py-8 space-y-6">
        {/* Header with Actions */}
        <div className="flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              {getStatusIcon(transaction.status)}
              <h1 className="text-2xl font-bold">Transaction #{transaction.id}</h1>
            </div>
            {getStatusBadge(transaction.status)}
          </div>
          <div className="flex items-center gap-2">
            {isPolling && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Auto-refreshing...
              </div>
            )}

            {/* Quick Actions in Header */}
            <Button asChild variant="outline" size="sm">
              <Link href="/packages">
                <Package2 className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Browse Packages</span>
              </Link>
            </Button>

            <Button asChild variant="outline" size="sm">
              <Link href="/transactions">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">All Transactions</span>
              </Link>
            </Button>

            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" />
            </Button>

            {/* More Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/packages" className="flex items-center">
                    <Package2 className="mr-2 h-4 w-4" />
                    Browse More Packages
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/transactions" className="flex items-center">
                    <History className="mr-2 h-4 w-4" />
                    View All Transactions
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Receipt
                </DropdownMenuItem>
                {transaction.status === 'FAILED' && (
                  <DropdownMenuItem onClick={() => window.location.href = '/packages'}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Status Alert */}
        {transaction.status === 'FAILED' && transaction.error_message && (
          <Alert variant="destructive" className="no-print">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-medium">
              Transaction failed: {transaction.error_message}
            </AlertDescription>
          </Alert>
        )}

        {transaction.status === 'PROCESSING' && (
          <Alert className="no-print">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Your transaction is being processed. This usually takes a few minutes.
            </AlertDescription>
          </Alert>
        )}

        {/* Print Content */}
        <div className="print-content">
          {/* Print Header */}
          <div className="print-header hidden print:block">
            <h1>IM3Wrap</h1>
            <p><strong>Transaction Receipt</strong></p>
            <p>Printed on: {format(new Date(), 'MMM dd, yyyy HH:mm')}</p>
          </div>

          {/* Print-only consolidated content */}
          <div className="hidden print:block">
            {/* Transaction Summary */}
            <div className="print-section print-keep-together">
              <h3>Transaction Summary</h3>
              <table className="print-transaction-info">
                <tbody>
                  <tr>
                    <td className="label">Transaction ID</td>
                    <td className="value">#{transaction.id}</td>
                  </tr>
                  <tr>
                    <td className="label">Status</td>
                    <td className="value">{transaction.status}</td>
                  </tr>
                  <tr>
                    <td className="label">Transaction Date</td>
                    <td className="value">{format(createdDate, 'MMM dd, yyyy HH:mm')}</td>
                  </tr>
                  {transaction.completion_time && (
                    <tr>
                      <td className="label">Completion Date</td>
                      <td className="value">{format(parseDate(transaction.completion_time), 'MMM dd, yyyy HH:mm')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Package Information */}
            <div className="print-section print-keep-together">
              <h3>Package Details</h3>
              <table className="print-transaction-info">
                <tbody>
                <tr>
                  <td className="label">Package Name</td>
                  <td className="value">{transaction.package?.package_name || 'Unknown Package'}</td>
                </tr>
                {hasDiscount() && (
                  <tr>
                    <td className="label">Original Price</td>
                    <td className="value" style={{textDecoration: 'line-through', color: '#666'}}>
                      {formatPrice(transaction.package!.discount_price)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="label">Package Price</td>
                  <td className="value"><strong>{formatPrice(transaction.package!.normal_price)}</strong></td>
                </tr>
                <tr>
                  <td className="label">Platform Fee Price</td>
                  <td className="value"><strong>{formatPrice(platformFee)}</strong></td>
                </tr>
                <tr>
                  <td className="label">Total Paid</td>
                  <td className="value"><strong>{formatPrice(transaction.package!.normal_price + platformFee)}</strong>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Original screen content (hidden in print) */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start print:hidden">
            {/* Package Details - Left Column (3/4 width) */}
            <div className="lg:col-span-3">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package2 className="h-5 w-5" />
                    Package Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Package Name */}
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {transaction.package?.package_name || 'Unknown Package'}
                    </h3>
                    <p className="text-gray-600">
                      Keyword: {transaction.package?.keyword || 'N/A'}
                    </p>
                  </div>

                  {/* Package Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Package Code</label>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono flex-1 break-all">
                          {transaction.package?.pvr_code || 'N/A'}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(transaction.package?.pvr_code || '', 'Package code')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Activation Keyword</label>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono flex-1">
                          {transaction.package?.keyword || 'N/A'}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(transaction.package?.keyword || '', 'Activation keyword')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Manual Activation Instructions */}
                  {transaction.package?.keyword && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Manual Activation</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        If the package wasn't automatically activated, you can activate it manually:
                      </p>
                      <ol className="text-sm space-y-1 list-decimal list-inside text-gray-700">
                        <li>Open your IM3 app</li>
                        <li>Search for the package <b>{transaction.package.package_name}</b></li>
                        <li>Buy it manually</li>
                      </ol>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Compact Transaction Info (1/4 width) */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  {/* Pricing Section */}
                  <div className="space-y-3">
                    {hasDiscount() ? (
                      // When there's a discount, show strikethrough normal price and green discount price
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Package Price</span>
                          <div className="text-right">
                            <p className="text-sm text-gray-400 line-through">
                              {formatPrice(transaction.package!.normal_price)}
                            </p>
                            <p className="text-lg font-semibold text-green-600">
                              {formatPrice(transaction.package!.discount_price)}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      // When there's no discount, show only normal price
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Package Price</span>
                        <span className="text-lg font-semibold text-green-600">
                          {formatPrice(transaction.package!.normal_price)}
                        </span>
                      </div>
                    )}

                    <hr />

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Paid</span>
                      <span className="text-xl font-bold text-green-600">
                        {formatPrice(transactionPrice)}
                      </span>
                    </div>
                  </div>

                  <hr />

                  {/* Timeline Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Clock className="h-4 w-4" />
                      Timeline
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 rounded-full p-1.5 mt-1">
                          <Calendar className="h-3 w-3 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">Transaction Created</p>
                          <p className="text-sm text-gray-600">
                            {format(createdDate, 'MMM dd, HH:mm')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDistanceToNow(createdDate, { addSuffix: true })}
                          </p>
                        </div>
                      </div>

                      {transaction.completion_time && (
                        <div className="flex items-start gap-3">
                          <div className={`rounded-full p-1.5 mt-1 ${
                            transaction.status === 'SUCCESS' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {transaction.status === 'SUCCESS' ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {transaction.status === 'SUCCESS' ? 'Completed' : 'Failed'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {format(parseDate(transaction.completion_time), 'MMM dd, HH:mm')}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDistanceToNow(parseDate(transaction.completion_time), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Print Button */}
                  <hr />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handlePrint}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print Receipt
                  </Button>

                  {/* Primary Action for Failed Transactions */}
                  {transaction.status === 'FAILED' && (
                    <Button size="sm" className="w-full" onClick={() => window.location.href = '/packages'}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try Again
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Print Footer */}
          <div className="print-footer hidden print:block print-keep-together">
            <p><strong>Thank you for using IM3Wrap!</strong></p>
            <p>For support, please visit our website or contact customer service.</p>
            <p style={{ fontSize: '9px', marginTop: '8px' }}>
              This is a computer-generated receipt. No signature required.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}