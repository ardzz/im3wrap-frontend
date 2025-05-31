'use client';

import { TransactionDetails } from '@/components/packages/transaction-details';
import { use } from 'react';

interface TransactionPageProps {
  params: Promise<{ id: string }>;
}

export default function TransactionPage({ params }: TransactionPageProps) {
  const { id } = use(params);
  const transactionId = parseInt(id);

  if (isNaN(transactionId)) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Invalid Transaction ID</h1>
          <p className="text-gray-600 mt-2">The transaction ID must be a valid number.</p>
        </div>
      </div>
    );
  }

  return <TransactionDetails transactionId={transactionId} />;
}