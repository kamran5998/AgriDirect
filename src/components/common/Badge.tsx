import React from 'react';

interface BadgeProps {
  variant?: 'emerald' | 'blue' | 'amber' | 'purple' | 'slate' | 'rose' | 'teal';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'emerald',
  size = 'md',
  children,
  icon,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] font-semibold gap-1',
    md: 'px-2.5 py-1 text-xs font-semibold gap-1.5',
  };

  const variantStyles = {
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    blue: 'bg-blue-50 text-blue-700 border border-blue-200/80',
    amber: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200/80',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200',
    rose: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    teal: 'bg-teal-50 text-teal-700 border border-teal-200/80',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full tracking-tight shrink-0 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
};

export const TrendBadge: React.FC<{ change: number; size?: 'sm' | 'md' }> = ({ change, size = 'sm' }) => {
  const isPositive = change >= 0;
  const isZero = change === 0;

  if (isZero) {
    return (
      <Badge variant="slate" size={size}>
        0.0%
      </Badge>
    );
  }

  return (
    <Badge variant={isPositive ? 'emerald' : 'rose'} size={size}>
      <span className="font-mono">{isPositive ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`}</span>
    </Badge>
  );
};
