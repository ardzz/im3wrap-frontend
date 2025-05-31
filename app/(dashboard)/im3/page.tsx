'use client';

import { IM3LinkForm } from '@/components/im3/im3-link-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Smartphone, Info } from 'lucide-react';

export default function IM3Page() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Smartphone className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">IM3 Account</h1>
          <p className="text-gray-600">Manage your IM3 account integration</p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Linking your IM3 account allows you to purchase packages directly and view your balance.
          You'll need to verify your phone number with an OTP code sent via SMS.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IM3LinkForm />

        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
            <CardDescription>
              Simple steps to link your IM3 account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium">Add Phone Number</h4>
                <p className="text-sm text-gray-600">
                  Ensure your IM3 phone number is added to your profile
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium">Request OTP</h4>
                <p className="text-sm text-gray-600">
                  Click "Send OTP" to receive a verification code via SMS
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium">Verify Code</h4>
                <p className="text-sm text-gray-600">
                  Enter the 6-digit code to link your IM3 account
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <div>
                <h4 className="font-medium">Ready to Use</h4>
                <p className="text-sm text-gray-600">
                  Start purchasing packages and managing your IM3 account
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}