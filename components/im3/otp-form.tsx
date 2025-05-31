'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Smartphone, Send, Check } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useIM3 } from '@/lib/hooks/use-im3';
import { useAuth } from '@/lib/hooks/use-auth';

const otpSchema = z.object({
  otp: z.string().min(4, 'OTP must be at least 4 digits').max(8, 'OTP must be at most 8 digits'),
});

type OTPFormData = z.infer<typeof otpSchema>;

interface OTPFormProps {
  onSuccess?: () => void;
}

export function OTPForm({ onSuccess }: OTPFormProps) {
  const [countdown, setCountdown] = useState(0);
  const { user } = useAuth();
  const { sendOTP, verifyOTP, isLoading, error, clearError, otpSent, transactionId } = useIM3();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  });

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = async () => {
    if (!user?.phone_number) {
      toast.error("Phone number required", {
        description: "Please add your phone number in your profile first.",
        action: {
          label: "Go to Profile",
          onClick: () => window.location.href = '/profile',
        },
      });
      return;
    }

    try {
      clearError();
      await sendOTP();
      setCountdown(60); // 60 seconds cooldown
      toast.success("OTP sent", {
        description: `OTP has been sent to +${user.phone_number}`,
      });
    } catch (error) {
      toast.error("Failed to send OTP", {
        description: "Please try again later.",
      });
    }
  };

  const onSubmit = async (data: OTPFormData) => {
    try {
      clearError();
      await verifyOTP(data.otp);
      reset();
      toast.success("OTP verified successfully", {
        description: "Your IM3 account has been linked successfully.",
      });
      onSuccess?.();
    } catch (error) {
      toast.error("OTP verification failed", {
        description: "Please check your OTP and try again.",
      });
    }
  };

  if (!user?.phone_number) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Link IM3 Account
          </CardTitle>
          <CardDescription>
            Verify your phone number to link your IM3 account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              Please add your phone number in your profile to link your IM3 account.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button asChild className="w-full">
              <a href="/profile">Update Profile</a>
            </Button>
          </div>
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
          We'll send an OTP to +{user.phone_number} to verify your IM3 account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!otpSent ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Click the button below to send an OTP to your registered phone number.
              </p>
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
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                placeholder="Enter the OTP you received"
                {...register('otp')}
                disabled={isLoading}
                className="text-center text-lg tracking-widest"
                maxLength={8}
              />
              {errors.otp && (
                <p className="text-sm text-red-500">{errors.otp.message}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
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

            {transactionId && (
              <p className="text-xs text-gray-500 text-center">
                Transaction ID: {transactionId}
              </p>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
}