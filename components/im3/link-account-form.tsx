'use client';

import { useState } from 'react';
import { CheckCircle, AlertTriangle, Smartphone } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OTPForm } from './otp-form';
import { useAuth } from '@/lib/hooks/use-auth';
import { useIM3 } from '@/lib/hooks/use-im3';

export function LinkAccountForm() {
  const [showOTPForm, setShowOTPForm] = useState(false);
  const { user } = useAuth();
  const { reset } = useIM3();

  const isLinked = !!user?.token_id;

  const handleStartLinking = () => {
    reset(); // Clear any previous state
    setShowOTPForm(true);
  };

  const handleLinkingSuccess = () => {
    setShowOTPForm(false);
    // Refresh the page to update the auth state
    window.location.reload();
  };

  if (isLinked) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            IM3 Account Linked
          </CardTitle>
          <CardDescription>
            Your IM3 account is successfully linked and ready to use.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-green-600" />
              <span className="font-medium">Account Status</span>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Linked
            </Badge>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              You can now purchase IM3 packages and manage your account.
            </p>
            <div className="mt-4 flex gap-2">
              <Button asChild className="flex-1">
                <a href="/packages">Browse Packages</a>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <a href="/profile?tab=im3">View Profile</a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showOTPForm) {
    return <OTPForm onSuccess={handleLinkingSuccess} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Link Your IM3 Account
        </CardTitle>
        <CardDescription>
          Connect your IM3 account to purchase packages and manage your mobile services.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!user?.phone_number && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You need to add your phone number to your profile before linking your IM3 account.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">What happens when you link your account?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• We'll send an OTP to your registered phone number</li>
              <li>• Verify the OTP to confirm your IM3 account ownership</li>
              <li>• Access your account balance and purchase packages</li>
              <li>• View your transaction history and package usage</li>
            </ul>
          </div>

          <div className="text-center">
            <Button
              onClick={handleStartLinking}
              disabled={!user?.phone_number}
              className="w-full"
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Start Linking Process
            </Button>
            {!user?.phone_number && (
              <p className="text-sm text-gray-500 mt-2">
                <Button variant="link" asChild className="p-0 h-auto">
                  <a href="/profile">Add your phone number first</a>
                </Button>
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}