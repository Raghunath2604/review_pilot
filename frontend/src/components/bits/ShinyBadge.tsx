import React from 'react';

interface ShinyBadgeProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const ShinyBadge: React.FC<ShinyBadgeProps> = ({
  children,
  icon,
  className = '',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold overflow-hidden border border-indigo-200/80 bg-white/80 shadow-sm transition-all duration-300 hover:shadow-md hover:border-indigo-400 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
      {icon && <span className="relative z-10">{icon}</span>}
      <span className="relative z-10 bg-gradient-to-r from-indigo-700 to-violet-700 bg-clip-text text-transparent">
        {children}
      </span>
    </div>
  );
};
