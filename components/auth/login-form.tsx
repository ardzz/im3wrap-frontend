'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/hooks/use-auth';
import Link from 'next/link';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const watchedFields = watch();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      clearError();
      await login(data.username, data.password);

      toast.success("Welcome back!", {
        description: "You have successfully signed in.",
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      });

      router.push('/dashboard');
    } catch (error) {
      toast.error("Sign in failed", {
        description: "Please check your credentials and try again.",
        icon: <AlertCircle className="h-4 w-4 text-red-600" />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push('/register');
  };

  const getFieldStatus = (fieldName: keyof LoginFormData) => {
    const hasError = errors[fieldName];
    const isTouched = touchedFields[fieldName];
    const hasValue = watchedFields[fieldName]?.length > 0;

    if (hasError) return 'error';
    if (isTouched && hasValue && !hasError) return 'success';
    return 'default';
  };

  return (
    <Card className="w-full backdrop-blur-sm bg-white/90 border-0 shadow-2xl shadow-blue-500/10">
      <CardHeader className="space-y-1 pb-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Sign In
          </h1>
          <p className="text-gray-600 text-sm mt-2">
            Enter your credentials to access your account
          </p>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="animate-shake">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {/* Username Field */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-gray-700">
              Username
            </Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className={`h-5 w-5 transition-colors ${
                  getFieldStatus('username') === 'error' ? 'text-red-400' :
                  getFieldStatus('username') === 'success' ? 'text-green-400' :
                  'text-gray-400 group-focus-within:text-blue-500'
                }`} />
              </div>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="Enter your username"
                className={`pl-10 pr-10 h-12 transition-all duration-200 ${
                  getFieldStatus('username') === 'error' 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' :
                  getFieldStatus('username') === 'success'
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20' :
                    'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
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
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className={`h-5 w-5 transition-colors ${
                  getFieldStatus('password') === 'error' ? 'text-red-400' :
                  getFieldStatus('password') === 'success' ? 'text-green-400' :
                  'text-gray-400 group-focus-within:text-blue-500'
                }`} />
              </div>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                className={`pl-10 pr-12 h-12 transition-all duration-200 ${
                  getFieldStatus('password') === 'error' 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' :
                  getFieldStatus('password') === 'success'
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20' :
                    'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
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
            {errors.password && (
              <p className="text-sm text-red-600 flex items-center gap-1 animate-slideDown">
                <AlertCircle className="h-3 w-3" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                disabled={isLoading || isSubmitting}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Forgot password?
              </a>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-6">
          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:scale-[1.02] shadow-lg hover:shadow-xl disabled:transform-none disabled:hover:scale-100"
            disabled={isLoading || isSubmitting || !isValid}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {(isLoading || isSubmitting) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="text-sm text-center text-gray-600">
            Don't have an account?{' '}
            <Link
              href="/register"
              onClick={handleSignUpClick}
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors hover:underline"
            >
              Sign up for free
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}