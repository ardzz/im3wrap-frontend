'use client';

import { useEffect, useState } from 'react';
import { usePackagesStore } from '@/lib/store/packages-store';
import { Package } from '@/lib/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import {
  Package2,
  Search,
  Grid3X3,
  List,
  Loader2,
  ShoppingCart,
  Tag,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PackageListProps {
  showPurchaseButton?: boolean;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'price-low' | 'price-high' | 'newest' | 'oldest';

const ITEMS_PER_PAGE_OPTIONS = [8, 12, 16, 20, 24];

export function PackageList({ showPurchaseButton = true }: PackageListProps) {
  const router = useRouter();
  const { packages, isLoadingPackages, error, loadPackages, purchasePackage, isPurchasing } = usePackagesStore();

  // State for pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [purchasingPackageId, setPurchasingPackageId] = useState<number | null>(null);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  // Filter and sort packages
  const filteredAndSortedPackages = packages
    .filter(pkg => {
      const searchLower = searchQuery.toLowerCase();
      return (
        pkg.package_name.toLowerCase().includes(searchLower) ||
        pkg.keyword.toLowerCase().includes(searchLower) ||
        pkg.pvr_code.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.package_name.localeCompare(b.package_name);
        case 'price-low':
          return getPackagePrice(a) - getPackagePrice(b);
        case 'price-high':
          return getPackagePrice(b) - getPackagePrice(a);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return 0;
      }
    });

  // Pagination calculations
  const totalItems = filteredAndSortedPackages.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPackages = filteredAndSortedPackages.slice(startIndex, endIndex);

  // Reset to first page when search/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, itemsPerPage]);

  const getPackagePrice = (pkg: Package) => {
    return pkg.discount_price > 0 ? pkg.discount_price : pkg.normal_price;
  };

  const hasDiscount = (pkg: Package) => {
    return pkg.discount_price > 0 && pkg.discount_price < pkg.normal_price;
  };

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const handlePurchase = async (packageId: number) => {
    if (!showPurchaseButton) return;

    try {
      setPurchasingPackageId(packageId);
      const result = await purchasePackage(packageId);

      toast.success("Package purchased successfully!", {
        description: "Redirecting to transaction details...",
        action: {
          label: "View Details",
          onClick: () => router.push(`/transactions/${result.transaction_id}`),
        },
      });

      // Redirect to transaction details
      router.push(`/transactions/${result.transaction_id}`);
    } catch (error) {
      toast.error("Purchase failed", {
        description: "Please try again later.",
      });
    } finally {
      setPurchasingPackageId(null);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (isLoadingPackages) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search packages, keywords, or codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Sort */}
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="price-low">Price Low-High</SelectItem>
              <SelectItem value="price-high">Price High-Low</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>

          {/* Items per page */}
          <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ITEMS_PER_PAGE_OPTIONS.map(option => (
                <SelectItem key={option} value={option.toString()}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} packages
        </span>
        {searchQuery && (
          <span>
            Search results for "<strong>{searchQuery}</strong>"
          </span>
        )}
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* No Results */}
      {!isLoadingPackages && currentPackages.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No packages found' : 'No packages available'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? `No packages match your search for "${searchQuery}"`
                : 'There are no packages available at the moment.'
              }
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Package Grid/List */}
      {currentPackages.length > 0 && (
        <div className={
          viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }>
          {currentPackages.map((pkg) => (
            viewMode === 'grid' ? (
              <PackageCard
                key={pkg.id}
                package={pkg}
                showPurchaseButton={showPurchaseButton}
                onPurchase={handlePurchase}
                isPurchasing={purchasingPackageId === pkg.id}
              />
            ) : (
              <PackageListItem
                key={pkg.id}
                package={pkg}
                showPurchaseButton={showPurchaseButton}
                onPurchase={handlePurchase}
                isPurchasing={purchasingPackageId === pkg.id}
              />
            )
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center gap-1">
            {/* First page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {getVisiblePages().map((page, index) => (
                page === '...' ? (
                  <span key={`dots-${index}`} className="px-2 text-gray-400">...</span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page as number)}
                    className="min-w-[36px]"
                  >
                    {page}
                  </Button>
                )
              ))}
            </div>

            {/* Next page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Fixed Height Package Card Component for Grid View
function PackageCard({
  package: pkg,
  showPurchaseButton,
  onPurchase,
  isPurchasing
}: {
  package: Package;
  showPurchaseButton: boolean;
  onPurchase: (id: number) => void;
  isPurchasing: boolean;
}) {
  const price = pkg.discount_price > 0 ? pkg.discount_price : pkg.normal_price;
  const hasDiscount = pkg.discount_price > 0 && pkg.discount_price < pkg.normal_price;

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] relative overflow-hidden flex flex-col h-full">
      {hasDiscount && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="destructive" className="bg-red-500">
            <Tag className="h-3 w-3 mr-1" />
            Sale
          </Badge>
        </div>
      )}

      {/* Header - Fixed height area */}
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start gap-2">
          <div className="bg-blue-100 rounded-lg p-2 flex-shrink-0">
            <Package2 className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            {/* Fixed height container for package name */}
            <div className="h-12 flex items-start">
              <CardTitle className="text-lg leading-tight line-clamp-2">
                {pkg.package_name}
              </CardTitle>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Content - Flexible area */}
      <CardContent className="flex-1 flex flex-col justify-between space-y-4">
        {/* Price - Always positioned consistently */}
        <div className="space-y-1">
          {hasDiscount ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-green-600">
                  Rp {pkg.discount_price.toLocaleString('id-ID')}
                </span>
                <Zap className="h-4 w-4 text-yellow-500" />
              </div>
              <span className="text-sm text-gray-400 line-through">
                Rp {pkg.normal_price.toLocaleString('id-ID')}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-green-600">
              Rp {pkg.normal_price.toLocaleString('id-ID')}
            </span>
          )}
        </div>

        {/* Purchase Button - Always at bottom */}
        {showPurchaseButton && (
          <div className="mt-auto pt-2">
            <Button
              onClick={() => onPurchase(pkg.id)}
              disabled={isPurchasing}
              className="w-full group-hover:bg-primary/90 transition-colors"
              size="sm"
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Purchase
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Package List Item Component for List View
function PackageListItem({
  package: pkg,
  showPurchaseButton,
  onPurchase,
  isPurchasing
}: {
  package: Package;
  showPurchaseButton: boolean;
  onPurchase: (id: number) => void;
  isPurchasing: boolean;
}) {
  const price = pkg.discount_price > 0 ? pkg.discount_price : pkg.normal_price;
  const hasDiscount = pkg.discount_price > 0 && pkg.discount_price < pkg.normal_price;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="bg-blue-100 rounded-lg p-2">
              <Package2 className="h-6 w-6 text-blue-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold">{pkg.package_name}</h3>
                {hasDiscount && (
                  <Badge variant="destructive" className="bg-red-500">
                    <Tag className="h-3 w-3 mr-1" />
                    Sale
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span>
                  Keyword: <code className="bg-gray-100 px-2 py-1 rounded">{pkg.keyword}</code>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(pkg.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Price */}
            <div className="text-right">
              {hasDiscount ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xl font-bold text-green-600">
                      Rp {pkg.discount_price.toLocaleString('id-ID')}
                    </span>
                    <Zap className="h-4 w-4 text-yellow-500" />
                  </div>
                  <span className="text-sm text-gray-400 line-through block">
                    Rp {pkg.normal_price.toLocaleString('id-ID')}
                  </span>
                </div>
              ) : (
                <span className="text-xl font-bold text-green-600">
                  Rp {pkg.normal_price.toLocaleString('id-ID')}
                </span>
              )}
            </div>

            {/* Purchase Button */}
            {showPurchaseButton && (
              <Button
                onClick={() => onPurchase(pkg.id)}
                disabled={isPurchasing}
                className="min-w-[120px]"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Purchase
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}