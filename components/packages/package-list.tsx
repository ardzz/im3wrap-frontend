'use client';

import { useEffect, useState } from 'react';
import { Package } from '@/lib/types/api';
import { usePackagesStore } from '@/lib/store/packages-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Search,
  Package2,
  Smartphone,
  Wifi,
  Phone,
  MessageSquare,
  Clock,
  AlertCircle,
  Loader2,
  Filter,
  Star,
  Gamepad2,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface PackageListProps {
  onPackageSelect?: (pkg: Package) => void;
  showPurchaseButton?: boolean;
}

export function PackageList({ onPackageSelect, showPurchaseButton = true }: PackageListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price' | 'name' | 'discount'>('price');

  const {
    packages,
    isLoading,
    error,
    isPurchasing,
    loadPackages,
    purchasePackage,
    clearError,
  } = usePackagesStore();

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const handlePurchase = async (pkg: Package) => {
    try {
      clearError();
      const result = await purchasePackage(pkg.id);

      toast.success('Purchase initiated!', {
        description: `Package "${pkg.package_name}" purchase is being processed. Transaction ID: ${result.transaction_id}`,
        duration: 5000,
      });

      // Redirect to transaction details
      window.location.href = `/transactions/${result.transaction_id}`;
    } catch (error) {
      toast.error('Purchase failed', {
        description: 'Please check your IM3 account and try again.',
      });
    }
  };

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  // Fixed price logic: when discount_price is 0, use normal_price
  const getDisplayPrice = (pkg: Package) => {
    return pkg.normal_price;
  };

  const hasDiscount = (pkg: Package) => {
    return pkg.discount_price > 0;
  };

  const getDiscountPercentage = (pkg: Package) => {
    if (!hasDiscount(pkg)) return 0;
    return Math.round(((pkg.normal_price - pkg.discount_price) / pkg.normal_price) * 100);
  };

  const getPackageIcon = (packageName: string) => {
    const name = packageName.toLowerCase();
    if (name.includes('unlimited')) return <Zap className="h-5 w-5" />;
    if (name.includes('game') || name.includes('play')) return <Gamepad2 className="h-5 w-5" />;
    if (name.includes('data') || name.includes('internet') || name.includes('gb')) return <Wifi className="h-5 w-5" />;
    if (name.includes('call') || name.includes('voice')) return <Phone className="h-5 w-5" />;
    if (name.includes('sms') || name.includes('text')) return <MessageSquare className="h-5 w-5" />;
    if (name.includes('fun') || name.includes('app')) return <Star className="h-5 w-5" />;
    return <Package2 className="h-5 w-5" />;
  };

  const getPackageCategory = (packageName: string) => {
    const name = packageName.toLowerCase();
    if (name.includes('unlimited')) return 'Unlimited';
    if (name.includes('game') || name.includes('play')) return 'Gaming';
    if (name.includes('data') || name.includes('internet') || name.includes('gb')) return 'Data';
    if (name.includes('call') || name.includes('voice')) return 'Voice';
    if (name.includes('fun') || name.includes('app')) return 'Apps';
    return 'Other';
  };

  const extractDataQuota = (packageName: string) => {
    const match = packageName.match(/(\d+)\s*GB/i);
    return match ? `${match[1]}GB` : '';
  };

  const extractValidity = (keyword: string) => {
    const match = keyword.match(/(\d+)D/);
    return match ? `${match[1]} Days` : '30 Days';
  };

  // Filter and sort packages
  const filteredPackages = packages
    .filter(pkg => {
      const matchesSearch = pkg.package_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pkg.keyword.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' ||
                             getPackageCategory(pkg.package_name).toLowerCase() === filterCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return getDisplayPrice(a) - getDisplayPrice(b);
        case 'name':
          return a.package_name.localeCompare(b.package_name);
        case 'discount':
          const discountA = getDiscountPercentage(a);
          const discountB = getDiscountPercentage(b);
          return discountB - discountA;
        default:
          return 0;
      }
    });

  const categories = ['all', 'data', 'unlimited', 'gaming', 'voice', 'apps', 'other'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'price' | 'name' | 'discount')}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white"
        >
          <option value="price">Lowest Price</option>
          <option value="discount">Best Discount</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      {/* Package Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => {
          const discountPercentage = getDiscountPercentage(pkg);
          const category = getPackageCategory(pkg.package_name);
          const dataQuota = extractDataQuota(pkg.package_name);
          const validity = extractValidity(pkg.keyword);
          const displayPrice = getDisplayPrice(pkg);
          const isDiscounted = hasDiscount(pkg);

          return (
            <Card
              key={pkg.id}
              className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onPackageSelect?.(pkg)}
            >
              {isDiscounted && discountPercentage > 0 && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge variant="destructive" className="bg-red-500">
                    -{discountPercentage}%
                  </Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getPackageIcon(pkg.package_name)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{pkg.package_name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        {category}
                      </Badge>
                      {dataQuota && (
                        <Badge variant="secondary">
                          {dataQuota}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {validity}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Keyword:</span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {pkg.keyword}
                    </code>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">
                    {formatPrice(getDisplayPrice(pkg))}
                  </span>
                    {isDiscounted && (
                      <span className="text-sm text-gray-500 line-through">{formatPrice(pkg.discount_price)}</span>
                    )}
                  </div>

                  {showPurchaseButton && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchase(pkg);
                      }}
                      disabled={isPurchasing}
                      className="w-full"
                    >
                      {isPurchasing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Smartphone className="mr-2 h-4 w-4" />
                      )}
                      Purchase - {formatPrice(displayPrice)}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPackages.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Package2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
          <p className="text-gray-500">
            {searchTerm || filterCategory !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'No packages are available at the moment.'}
          </p>
        </div>
      )}
    </div>
  );
}