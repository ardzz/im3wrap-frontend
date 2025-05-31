'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Smartphone, CheckCircle, AlertCircle, Send, RefreshCw, User, Info } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIM3Store } from '@/lib/store/im3-store';
import { useAuth } from '@/lib/hooks/use-auth';

const otpSchema = z.object({
  otp: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

type OTPFormData = z.infer<typeof otpSchema>;

export function IM3LinkForm() {
  const [countdown, setCountdown] = useState(0);
  const { user, refreshUser } = useAuth();
  const {
    sendOTP,
    verifyOTP,
    loadProfile,
    loadBalance,
    clearError,
    isLoading,
    isVerifying,
    error,
    otpSent,
    isLinked,
    profile,
    isLoadingBalance,
  } = useIM3Store();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  });

  // Load IM3 profile on component mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = async () => {
    if (!user?.phone_number) {
      toast.error('Phone number required', {
        description: 'Please add a phone number to your profile first.',
      });
      return;
    }

    try {
      clearError();
      await sendOTP();
      setCountdown(60);
      toast.success('OTP sent!', {
        description: `OTP has been sent to ${user.phone_number}`,
      });
    } catch (error) {
      toast.error('Failed to send OTP', {
        description: 'Please try again or check your phone number.',
      });
    }
  };

  const onSubmit = async (data: OTPFormData) => {
    try {
      clearError();
      await verifyOTP(data.otp);

      toast.success('IM3 account linked!', {
        description: 'Your IM3 account has been successfully linked. The page will refresh automatically.',
        duration: 3000,
      });

      reset();

      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      toast.error('OTP verification failed', {
        description: 'Please check your OTP and try again.',
      });
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('0')) {
      return '+62' + phone.slice(1);
    }
    return phone;
  };

  const formatBalance = (balance: number | undefined | null) => {
    if (typeof balance !== 'number' || isNaN(balance)) {
      return 'N/A';
    }
    return `Rp ${balance.toLocaleString('id-ID')}`;
  };

  const handleRefresh = async () => {
    try {
      await Promise.all([
        loadProfile(),
        refreshUser()
      ]);
      toast.success('Status refreshed!');
    } catch (error) {
      toast.error('Failed to refresh status');
    }
  };

  if ((isLinked || user?.token_id) && profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            IM3 Account Linked
          </CardTitle>
          <CardDescription>
            Your IM3 account is successfully linked to your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.img} alt={profile.name} />
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{profile.name || 'IM3 User'}</h3>
              <p className="text-sm text-gray-600">{formatPhoneNumber(profile.mob)}</p>
              <Badge variant={profile.status === 'ACTIVE' ? 'default' : 'destructive'} className="mt-1">
                {profile.status}
              </Badge>
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Mobile Number</Label>
              <p className="text-sm text-gray-600">{formatPhoneNumber(profile.mob)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Account Name</Label>
              <p className="text-sm text-gray-600">{profile.name || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <p className="text-sm text-gray-600">{profile.email || 'Not provided'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">User Type</Label>
              <p className="text-sm text-gray-600">{profile.usertype || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Balance</Label>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">{formatBalance(profile.balance)}</p>
                {isLoadingBalance && <Loader2 className="h-3 w-3 animate-spin" />}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Membership ID</Label>
              <p className="text-sm text-gray-600">{profile.membershipid || 'N/A'}</p>
            </div>
          </div>

          {/* Alerts */}
          {profile.alerts && profile.alerts.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Account Alerts</Label>
              {profile.alerts.map((alert, index) => (
                <Alert key={index}>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{alert.title}</strong><br />
                    {alert.description}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isLoading || isLoadingBalance}
            className="w-full"
          >
            {(isLoading || isLoadingBalance) ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh Profile
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Link IM3 Account
        </CardTitle>
        <CardDescription>
          Link your IM3 account to purchase packages directly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!user?.phone_number ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please add a phone number to your profile before linking your IM3 account.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={formatPhoneNumber(user.phone_number)}
                  disabled
                  className="bg-gray-50"
                />
                <Badge variant="outline">Verified</Badge>
              </div>
              <p className="text-xs text-gray-500">
                OTP will be sent to this number
              </p>
            </div>

            {!otpSent ? (
              <Button
                onClick={handleSendOTP}
                disabled={isLoading || countdown > 0}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {countdown > 0 ? `Resend in ${countdown}s` : 'Send OTP'}
              </Button>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    {...register('otp')}
                    disabled={isVerifying}
                    className="text-center text-lg tracking-widest"
                  />
                  {errors.otp && (
                    <p className="text-sm text-red-500">{errors.otp.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Enter the 6-digit code sent to {formatPhoneNumber(user.phone_number)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isVerifying}
                    className="flex-1"
                  >
                    {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify OTP
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendOTP}
                    disabled={isLoading || countdown > 0}
                  >
                    {countdown > 0 ? `${countdown}s` : 'Resend'}
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}