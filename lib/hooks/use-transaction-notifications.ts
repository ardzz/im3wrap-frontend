import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { TransactionWithDetails } from '@/lib/types/api';

export function useTransactionNotifications(transaction: TransactionWithDetails | null) {
  const previousStatusRef = useRef<string | null>(null);

  useEffect(() => {
    if (!transaction) return;

    const currentStatus = transaction.status;
    const previousStatus = previousStatusRef.current;

    // Don't show notification on first load
    if (previousStatus === null) {
      previousStatusRef.current = currentStatus;
      return;
    }

    // Show notification only if status changed
    if (previousStatus !== currentStatus) {
      switch (currentStatus) {
        case 'SUCCESS':
          toast.success('Transaction Completed!', {
            description: `Your package "${transaction.package?.package_name}" has been activated successfully.`,
            duration: 5000,
          });
          break;
        case 'FAILED':
          toast.error('Transaction Failed', {
            description: transaction.error_message || 'Your transaction could not be completed. Please try again.',
            duration: 7000,
          });
          break;
        case 'PROCESSING':
          toast.info('Transaction Processing', {
            description: 'Your transaction is now being processed. Please wait...',
            duration: 3000,
          });
          break;
      }
    }

    previousStatusRef.current = currentStatus;
  }, [transaction?.status, transaction?.package?.package_name, transaction?.error_message]);
}