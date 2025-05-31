import { useEffect, useRef, useState } from 'react';
import { usePackagesStore } from '@/lib/store/packages-store';

export function useTransactionStatus(transactionId: number) {
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { getTransaction, selectedTransaction } = usePackagesStore();

  const startPolling = () => {
    if (intervalRef.current || !transactionId) return;

    setIsPolling(true);
    intervalRef.current = setInterval(async () => {
      try {
        await getTransaction(transactionId);
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000); // Poll every 3 seconds
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsPolling(false);
    }
  };

  useEffect(() => {
    // Start polling if transaction is in processing state
    if (selectedTransaction &&
        (selectedTransaction.status === 'PROCESSING' || selectedTransaction.status === 'PENDING')) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [selectedTransaction?.status]);

  useEffect(() => {
    // Initial load
    if (transactionId) {
      getTransaction(transactionId);
    }

    return () => stopPolling();
  }, [transactionId]);

  return {
    isPolling,
    startPolling,
    stopPolling,
    transaction: selectedTransaction,
  };
}