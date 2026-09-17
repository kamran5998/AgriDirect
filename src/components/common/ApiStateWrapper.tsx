import React from 'react';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorMessage } from './ErrorMessage';
import { EmptyState } from './EmptyState';

interface ApiStateWrapperProps {
  isLoading: boolean;
  error?: string | Error | null;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  skeletonCount?: number;
  skeletonVariant?: 'card' | 'table-row' | 'chart' | 'text';
  customSkeleton?: React.ReactNode;
  customEmpty?: React.ReactNode;
  children: React.ReactNode;
}

export const ApiStateWrapper: React.FC<ApiStateWrapperProps> = ({
  isLoading,
  error,
  isEmpty = false,
  emptyTitle,
  emptyDescription,
  onRetry,
  skeletonCount = 3,
  skeletonVariant = 'card',
  customSkeleton,
  customEmpty,
  children,
}) => {
  if (isLoading) {
    return (
      customSkeleton || (
        <LoadingSkeleton count={skeletonCount} variant={skeletonVariant} />
      )
    );
  }

  if (error) {
    const errorMsg = typeof error === 'string' ? error : error.message;
    return <ErrorMessage message={errorMsg} onRetry={onRetry} />;
  }

  if (isEmpty) {
    return (
      customEmpty || (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          onAction={onRetry}
        />
      )
    );
  }

  return <>{children}</>;
};
