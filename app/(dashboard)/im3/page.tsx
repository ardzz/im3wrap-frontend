'use client';

import { EnhancedIM3LinkForm } from '@/components/im3/im3-link-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Smartphone,
  Info,
  Shield,
  Zap,
  CheckCircle,
  Package2,
  History,
  RefreshCw,
  Settings,
  CreditCard,
  Signal,
  Globe,
  Phone,
  MessageSquare
} from 'lucide-react';
import { useIM3 } from '@/lib/hooks/use-im3';
import { useAuth } from '@/lib/hooks/use-auth';
import Link from 'next/link';

export default function IM3Page() {
  const { user } = useAuth();
  const { isIM3Linked, profile, isLoading, loadProfile } = useIM3();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-black rounded-xl p-2">
            <Smartphone className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r bg-clip-text">
              IM3 Account Management
            </h1>
            <p className="text-gray-600">
              {isIM3Linked ? 'Manage your connected IM3 account' : 'Connect your IM3 account to get started'}
            </p>
          </div>
        </div>

        {isIM3Linked && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadProfile()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button asChild size="sm">
              <Link href="/packages">
                <Package2 className="h-4 w-4 mr-2" />
                Browse Packages
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Status Banner */}
      {isIM3Linked ? (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Account Connected!</strong> Your IM3 account is successfully linked and ready to use.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Link your IM3 account to purchase packages directly and view your balance.
            You'll need to verify your phone number with an OTP code sent via SMS.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Account Card */}
        <div className="lg:col-span-2">
          <EnhancedIM3LinkForm />
        </div>

        {/* Quick Actions & Info Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          {isIM3Linked && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start">
                  <Link href="/packages">
                    <Package2 className="mr-2 h-4 w-4" />
                    Browse Packages
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/transactions">
                    <History className="mr-2 h-4 w-4" />
                    View Transactions
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/profile">
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* How it Works - Enhanced */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-5 w-5 text-blue-600" />
                How it Works
              </CardTitle>
              <CardDescription>
                Simple steps to link your IM3 account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Add Phone Number</h4>
                    <p className="text-xs text-gray-600">
                      Ensure your IM3 phone number is added to your profile
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Request OTP</h4>
                    <p className="text-xs text-gray-600">
                      Click &#34;Send OTP&#34; to receive a verification code via SMS
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Verify Code</h4>
                    <p className="text-xs text-gray-600">
                      Enter the 6-digit code to link your IM3 account
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Ready to Use</h4>
                    <p className="text-xs text-gray-600">
                      Start purchasing packages and managing your IM3 account
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}