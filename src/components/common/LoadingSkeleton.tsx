import React from 'react';

interface LoadingSkeletonProps {
  count?: number;
  className?: string;
  variant?: 'card' | 'table-row' | 'chart' | 'text';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 1,
  className = '',
  variant = 'card',
}) => {
  const items = Array.from({ length: count });

  if (variant === 'table-row') {
    return (
      <>
        {items.map((_, i) => (
          <tr key={i} className="animate-pulse border-b border-slate-100 dark:border-slate-800">
            <td className="p-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28"></div>
            </td>
            <td className="p-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20"></div>
            </td>
            <td className="p-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
            </td>
            <td className="p-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16"></div>
            </td>
            <td className="p-4 text-right">
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-20 ml-auto"></div>
            </td>
          </tr>
        ))}
      </>
    );
  }

  if (variant === 'chart') {
    return (
      <div className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse ${className}`}>
        <div className="flex justify-between mb-6">
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-40"></div>
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
        </div>
        <div className="h-56 bg-slate-100 dark:bg-slate-800/50 rounded-2xl flex items-end gap-2 p-4">
          <div className="w-1/6 bg-slate-200 dark:bg-slate-800 h-24 rounded-t"></div>
          <div className="w-1/6 bg-slate-200 dark:bg-slate-800 h-36 rounded-t"></div>
          <div className="w-1/6 bg-slate-200 dark:bg-slate-800 h-48 rounded-t"></div>
          <div className="w-1/6 bg-slate-200 dark:bg-slate-800 h-32 rounded-t"></div>
          <div className="w-1/6 bg-slate-200 dark:bg-slate-800 h-44 rounded-t"></div>
          <div className="w-1/6 bg-slate-200 dark:bg-slate-800 h-52 rounded-t"></div>
        </div>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`space-y-2 animate-pulse ${className}`}>
        {items.map((_, i) => (
          <div
            key={i}
            className="h-4 bg-slate-200 dark:bg-slate-800 rounded"
            style={{ width: `${Math.max(40, 100 - i * 15)}%` }}
          ></div>
        ))}
      </div>
    );
  }

  // Default card skeleton
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((_, i) => (
        <div
          key={i}
          className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse space-y-4 ${className}`}
        >
          <div className="flex justify-between items-center">
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-16"></div>
          </div>
          <div className="space-y-2">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
          </div>
          <div className="h-10 bg-slate-100 dark:bg-slate-800/60 rounded-xl"></div>
        </div>
      ))}
    </div>
  );
};
