'use client';

import { PackageList } from '@/components/packages/package-list';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package2, Info, Smartphone } from 'lucide-react';
import { useIM3 } from '@/lib/hooks/use-im3';

export default function PackagesPage() {
  const { isIM3Linked } = useIM3();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Package2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">IM3 Packages</h1>
          <p className="text-gray-600">Browse and purchase IM3 data packages</p>
        </div>
      </div>

      {!isIM3Linked && (
        <Alert>
          <Smartphone className="h-4 w-4" />
          <AlertDescription>
            Please link your IM3 account first to purchase packages.
            <a href="/im3" className="ml-1 text-primary hover:underline">
              Link IM3 Account →
            </a>
          </AlertDescription>
        </Alert>
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          All packages shown are official IM3 packages. Prices are in Indonesian Rupiah (IDR).
          Package activation may take a few minutes after successful purchase.
        </AlertDescription>
      </Alert>

      <PackageList showPurchaseButton={isIM3Linked} />
    </div>
  );
}