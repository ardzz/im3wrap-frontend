'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2, User, Mail, Lock, Phone, CheckCircle, AlertCircle, Shield, Info } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/hooks/use-auth';
import Link from 'next/link';

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(80, 'Username must be less than 80 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
    .regex(/^(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
    .regex(/^(?=.*\d)/, 'Password must contain at least one number'),
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
  terms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();
  const { register: registerUser, isLoading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      terms: false,
    },
  });

  const watchedFields = watch();
  const watchedPassword = watch('password');

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Calculate password strength
  useEffect(() => {
    if (!watchedPassword) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (watchedPassword.length >= 6) strength += 20;
    if (watchedPassword.length >= 8) strength += 10;
    if (/[a-z]/.test(watchedPassword)) strength += 20;
    if (/[A-Z]/.test(watchedPassword)) strength += 20;
    if (/\d/.test(watchedPassword)) strength += 20;
    if (/[^a-zA-Z\d]/.test(watchedPassword)) strength += 10;

    setPasswordStrength(Math.min(strength, 100));
  }, [watchedPassword]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      clearError();

      const registerData = {
        username: data.username,
        password: data.password,
        ...(data.email && { email: data.email }),
        ...(data.phone_number && { phone_number: data.phone_number }),
      };

      await registerUser(registerData);

      toast.success("Account created!", {
        description: "Your account has been created successfully.",
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      });

      router.push('/dashboard');
    } catch (error) {
      toast.error("Registration failed", {
        description: "Please check your information and try again.",
        icon: <AlertCircle className="h-4 w-4 text-red-600" />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignInClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push('/login');
  };

  const getFieldStatus = (fieldName: keyof RegisterFormData) => {
    const hasError = errors[fieldName];
    const isTouched = touchedFields[fieldName];
    const hasValue = watchedFields[fieldName]?.toString().length > 0;

    if (hasError) return 'error';
    if (isTouched && hasValue && !hasError) return 'success';
    return 'default';
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return 'bg-red-500';
    if (passwordStrength < 60) return 'bg-yellow-500';
    if (passwordStrength < 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 30) return 'Weak';
    if (passwordStrength < 60) return 'Fair';
    if (passwordStrength < 80) return 'Good';
    return 'Strong';
  };

  return (
    <Card className="w-full backdrop-blur-sm bg-white/90 border-0 shadow-2xl shadow-purple-500/10">
      <CardHeader className="space-y-1 pb-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-gray-600 text-sm mt-2">
            Create a new account to get started
          </p>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-5">
          {error && (
            <Alert variant="destructive" className="animate-shake">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {/* Username Field */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-gray-700">
              Username <span className="text-red-500">*</span>
            </Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className={`h-5 w-5 transition-colors ${
                  getFieldStatus('username') === 'error' ? 'text-red-400' :
                  getFieldStatus('username') === 'success' ? 'text-green-400' :
                  'text-gray-400 group-focus-within:text-purple-500'
                }`} />
              </div>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="Choose a username"
                className={`pl-10 pr-10 h-12 transition-all duration-200 ${
                  getFieldStatus('username') === 'error' 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' :
                  getFieldStatus('username') === 'success'
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20' :
                    'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'
                } hover:border-gray-300 focus:ring-4`}
                {...register('username')}
                disabled={isLoading || isSubmitting}
              />
              {getFieldStatus('username') === 'success' && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
              )}
            </div>
            {errors.username && (
              <p className="text-sm text-red-600 flex items-center gap-1 animate-slideDown">
                <AlertCircle className="h-3 w-3" />
                {errors.username.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              3-80 characters, letters, numbers, and underscores only
            </p>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className={`h-5 w-5 transition-colors ${
                  getFieldStatus('password') === 'error' ? 'text-red-400' :
                  getFieldStatus('password') === 'success' ? 'text-green-400' :
                  'text-gray-400 group-focus-within:text-purple-500'
                }`} />
              </div>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Create a password"
                className={`pl-10 pr-12 h-12 transition-all duration-200 ${
                  getFieldStatus('password') === 'error' 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' :
                  getFieldStatus('password') === 'success'
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20' :
                    'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'
                } hover:border-gray-300 focus:ring-4`}
                {...register('password')}
                disabled={isLoading || isSubmitting}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPassword(!showPassword);
                }}
                disabled={isLoading || isSubmitting}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                )}
              </Button>
            </div>

            {/* Password Strength Indicator */}
            {watchedPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Password strength:</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength < 30 ? 'text-red-600' :
                    passwordStrength < 60 ? 'text-yellow-600' :
                    passwordStrength < 80 ? 'text-blue-600' :
                    'text-green-600'
                  }`}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${passwordStrength}%` }}
                  ></div>
                </div>
              </div>
            )}

            {errors.password && (
              <p className="text-sm text-red-600 flex items-center gap-1 animate-slideDown">
                <AlertCircle className="h-3 w-3" />
                {errors.password.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Must contain uppercase, lowercase, and number
            </p>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email <span className="text-gray-400">(Optional)</span>
            </Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className={`h-5 w-5 transition-colors ${
                  getFieldStatus('email') === 'error' ? 'text-red-400' :
                  getFieldStatus('email') === 'success' ? 'text-green-400' :
                  'text-gray-400 group-focus-within:text-purple-500'
                }`} />
              </div>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                className={`pl-10 pr-10 h-12 transition-all duration-200 ${
                  getFieldStatus('email') === 'error' 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' :
                  getFieldStatus('email') === 'success'
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20' :
                    'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'
                } hover:border-gray-300 focus:ring-4`}
                {...register('email')}
                disabled={isLoading || isSubmitting}
              />
              {getFieldStatus('email') === 'success' && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
              )}
            </div>
            {errors.email && (
              <p className="text-sm text-red-600 flex items-center gap-1 animate-slideDown">
                <AlertCircle className="h-3 w-3" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone Number Field */}
          <div className="space-y-2">
            <Label htmlFor="phone_number" className="text-sm font-medium text-gray-700">
              Phone Number <span className="text-gray-400">(Optional)</span>
            </Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className={`h-5 w-5 transition-colors ${
                  getFieldStatus('phone_number') === 'error' ? 'text-red-400' :
                  getFieldStatus('phone_number') === 'success' ? 'text-green-400' :
                  'text-gray-400 group-focus-within:text-purple-500'
                }`} />
              </div>
              <Input
                id="phone_number"
                type="tel"
                autoComplete="tel"
                placeholder="Enter your phone number"
                className={`pl-10 pr-10 h-12 transition-all duration-200 ${
                  getFieldStatus('phone_number') === 'error' 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' :
                  getFieldStatus('phone_number') === 'success'
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20' :
                    'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'
                } hover:border-gray-300 focus:ring-4`}
                {...register('phone_number')}
                disabled={isLoading || isSubmitting}
              />
              {getFieldStatus('phone_number') === 'success' && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
              )}
            </div>
            {errors.phone_number && (
              <p className="text-sm text-red-600 flex items-center gap-1 animate-slideDown">
                <AlertCircle className="h-3 w-3" />
                {errors.phone_number.message}
              </p>
            )}
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Required for IM3 account linking
            </p>
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded transition-colors mt-0.5"
                {...register('terms')}
                disabled={isLoading || isSubmitting}
              />
              <div className="text-sm">
                <label htmlFor="terms" className="text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-purple-600 hover:text-purple-500 font-medium underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-purple-600 hover:text-purple-500 font-medium underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-600 flex items-center gap-1 animate-slideDown">
                <AlertCircle className="h-3 w-3" />
                {errors.terms.message}
              </p>
            )}
          </div>

          {/* Security Notice */}
          <Alert className="bg-blue-50 border-blue-200">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Your account will be secured with industry-standard encryption.
              We never share your personal information with third parties.
            </AlertDescription>
          </Alert>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-6">
          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:scale-[1.02] shadow-lg hover:shadow-xl disabled:transform-none disabled:hover:scale-100"
            disabled={isLoading || isSubmitting || !isValid}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {(isLoading || isSubmitting) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or sign up with</span>
            </div>
          </div>

          <div className="text-sm text-center text-gray-600">
            Already have an account?{' '}
            <Link
              href="/login"
              onClick={handleSignInClick}
              className="font-medium text-purple-600 hover:text-purple-500 transition-colors hover:underline"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}