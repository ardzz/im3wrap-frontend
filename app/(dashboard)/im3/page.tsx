'use client';

import { useEffect } from 'react';
import { LinkAccountForm } from '@/components/im3/link-account-form';
import { IM3ProfileCard } from '@/components/profile/im3-profile-card';
import { useAuth } from '@/lib/hooks/use-auth';
import { useIM3 } from '@/lib/hooks/use-im3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Shield, Zap, CreditCard } from 'lucide-react';

export default function IM3Page() {
  const { user } = useAuth();
  const { loadProfile } = useIM3();
  const isLinked = !!user?.token_id;

  useEffect(() => {
    if (isLinked) {
      loadProfile();
    }
  }, [isLinked, loadProfile]);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">IM3 Integration</h1>
        <p className="text-gray-600 mt-2">
          Link and manage your IM3 account to access packages and services.
        </p>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-blue-600" />
              Secure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              OTP verification ensures secure account linking and transactions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-yellow-600" />
              Instant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Real-time package activation and immediate service access.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-green-600" />
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              View your current balance and manage your IM3 account funds.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Smartphone className="h-5 w-5 text-purple-600" />
              Packages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Purchase and manage data, voice, and SMS packages easily.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <LinkAccountForm />
        </div>

        {isLinked && (
          <div>
            <IM3ProfileCard />
          </div>
        )}
      </div>

      {/* Instructions Section */}
      {!isLinked && (
        <Card>
          <CardHeader>
            <CardTitle>How to Link Your IM3 Account</CardTitle>
            <CardDescription>
              Follow these simple steps to connect your IM3 account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-medium mb-2">Add Phone Number</h3>
                <p className="text-sm text-gray-600">
                  Make sure your phone number is added to your profile settings.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h3 className="font-medium mb-2">Request OTP</h3>
                <p className="text-sm text-gray-600">
                  Click "Start Linking Process" to receive an OTP on your phone.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <h3 className="font-medium mb-2">Verify & Link</h3>
                <p className="text-sm text-gray-600">
                  Enter the OTP to verify and link your IM3 account successfully.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}