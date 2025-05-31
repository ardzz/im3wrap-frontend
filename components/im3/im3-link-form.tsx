'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Smartphone,
  CheckCircle,
  ExternalLink,
  User,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  Calendar,
  RefreshCw,
  AlertTriangle,
  Info,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { useIM3 } from '@/lib/hooks/use-im3';
import { useAuth } from '@/lib/hooks/use-auth';
import { OTPForm } from './otp-form';
import { toast } from 'sonner';

export function EnhancedIM3LinkForm() {
  const { user } = useAuth();
  const { profile, isLoading, error, isIM3Linked, loadProfile } = useIM3();
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const maskPhoneNumber = (phone: string) => {
    if (!phone || phone.length < 4) return phone;
    const start = phone.substring(0, 3);
    const end = phone.substring(phone.length - 3);
    const masked = '•'.repeat(Math.max(4, phone.length - 6));
    return `${start}${masked}${end}`;
  };

  if (isIM3Linked && profile) {
    return (
      <div className="space-y-6">
        {/* Account Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-600" />
                <CardTitle>Account Information</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
                className="text-gray-500 hover:text-gray-700"
              >
                {showSensitiveInfo ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Mobile Number</p>
                      <p className="text-lg font-semibold">
                        +{showSensitiveInfo ? profile.mob : maskPhoneNumber(profile.mob)}
                      </p>
                    </div>
                  </div>
                  {showSensitiveInfo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(profile.mob, 'Mobile number')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Account Holder</p>
                      <p className="text-lg font-semibold">{profile.name || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <p className="text-lg font-semibold">{profile.email || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Balance</p>
                      <p className="text-xl font-bold">
                        {formatCurrency(profile.balance)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">User Type</p>
                      <p className="text-lg font-semibold">{profile.usertype || 'Standard'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Membership ID</p>
                      <p className="text-lg font-semibold">
                        {showSensitiveInfo
                          ? (profile.membershipid || 'Not available')
                          : (profile.membershipid ? maskPhoneNumber(profile.membershipid) : 'Not available')
                        }
                      </p>
                    </div>
                  </div>
                  {showSensitiveInfo && profile.membershipid && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(profile.membershipid, 'Membership ID')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Alerts */}
        {profile.alerts && profile.alerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Account Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.alerts.map((alert, index) => (
                  <Alert key={index} className="border-yellow-200 bg-yellow-50">
                    <Info className="h-4 w-4 text-yellow-600" />
                    <AlertDescription>
                      <div>
                        <h4 className="font-medium text-yellow-800">{alert.title}</h4>
                        <p className="text-yellow-700 text-sm mt-1">{alert.description}</p>
                        {alert.buttontext && (
                          <Button variant="outline" size="sm" className="mt-2 text-yellow-700 border-yellow-300 hover:bg-yellow-100">
                            {alert.buttontext}
                          </Button>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (!user?.phone_number) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Link IM3 Account
          </CardTitle>
          <CardDescription>
            Add your phone number to link your IM3 account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              Please add your IM3 phone number in your profile to link your account.
              This is required for OTP verification.
            </AlertDescription>
          </Alert>
          <div className="mt-6 space-y-3">
            <Button asChild className="w-full">
              <a href="/profile">
                <ExternalLink className="mr-2 h-4 w-4" />
                Update Profile
              </a>
            </Button>
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Make sure to add your IM3 phone number (starting with +62)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Link Your IM3 Account
          </CardTitle>
          <CardDescription>
            Follow the steps below to connect your IM3 account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Phone number added</span>
                </div>
                <Progress value={33} className="h-2" />
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Ready for verification:</strong> We'll send an OTP to <strong>+{user.phone_number}</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OTP Form */}
      <OTPForm />
    </div>
  );
}