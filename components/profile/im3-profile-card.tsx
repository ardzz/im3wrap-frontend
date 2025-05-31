'use client';

import { useState, useEffect } from 'react';
import { Smartphone, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useIM3 } from '@/lib/hooks/use-im3';
import { useAuth } from '@/lib/hooks/use-auth';

export function IM3ProfileCard() {
  const { user } = useAuth();
  const { profile, isLoading, error, loadProfile } = useIM3();
  const [isLinked, setIsLinked] = useState(false);

  useEffect(() => {
    setIsLinked(!!user?.token_id);
    if (user?.token_id) {
      loadProfile();
    }
  }, [user?.token_id, loadProfile]);

  const handleRefresh = () => {
    if (isLinked) {
      loadProfile();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!isLinked) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            IM3 Account
          </CardTitle>
          <CardDescription>
            Link your IM3 account to manage packages and view your profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your IM3 account is not linked yet. Go to the IM3 section to link your account.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button asChild className="w-full">
              <a href="/im3">Link IM3 Account</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            IM3 Account
          </CardTitle>
          <CardDescription>
            Your linked IM3 account information.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Linked
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        ) : profile ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Mobile Number</p>
                <p className="text-lg font-semibold">+{profile.mob}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Account Holder</p>
                <p className="text-lg">{profile.name}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Balance</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(profile.balance)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <Badge
                  variant={profile.status === 'ACTIVE' ? 'default' : 'destructive'}
                  className="text-sm"
                >
                  {profile.status}
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to load IM3 profile. Please try refreshing.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}