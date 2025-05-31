'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Save, User } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/hooks/use-auth';

const profileSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  phone_number: z
    .string()
    .regex(/^[0-9+\-\s()]*$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { user, updateProfile, isLoading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: user?.email || '',
      phone_number: user?.phone_number || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      clearError();
      const updateData: { email?: string; phone_number?: string } = {};

      if (data.email && data.email !== user?.email) {
        updateData.email = data.email;
      }
      if (data.phone_number && data.phone_number !== user?.phone_number) {
        updateData.phone_number = data.phone_number;
      }

      if (Object.keys(updateData).length === 0) {
        toast.info("No changes", {
          description: "No changes were made to your profile.",
        });
        return;
      }

      await updateProfile(updateData);
      reset({
        email: user?.email || '',
        phone_number: user?.phone_number || '',
      });

      toast.success("Profile updated", {
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast.error("Update failed", {
        description: "Failed to update your profile. Please try again.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Update your personal information and contact details.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={user?.username || ''}
              disabled
              className="bg-gray-50"
            />
            <p className="text-sm text-gray-500">Username cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              placeholder="Enter your phone number"
              {...register('phone_number')}
              disabled={isLoading}
            />
            {errors.phone_number && (
              <p className="text-sm text-red-500">{errors.phone_number.message}</p>
            )}
            <p className="text-sm text-gray-500">
              Required for IM3 account linking and OTP verification
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading || !isDirty}
              className="flex-1"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={isLoading || !isDirty}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}