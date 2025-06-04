import React from 'react';
import { cn } from '@/lib/utils';
import { getOnlineStatus } from '@/lib/utils';

interface OnlineIndicatorProps {
  lastSeen?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  className?: string;
  position?: 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left';
}

export const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({
  lastSeen,
  size = 'md',
  showStatus = false,
  className = '',
  position = 'bottom-right'
}) => {
  if (!lastSeen) return null;

  const onlineStatus = getOnlineStatus(lastSeen);
  
  const sizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const positionClasses = {
    'bottom-right': '-bottom-0.5 -right-0.5',
    'top-right': '-top-0.5 -right-0.5',
    'bottom-left': '-bottom-0.5 -left-0.5',
    'top-left': '-top-0.5 -left-0.5'
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div 
        className={cn(
          'rounded-full border-2 border-dark-1 relative',
          sizeClasses[size],
          onlineStatus.badge,
          !showStatus && 'absolute',
          !showStatus && positionClasses[position]
        )}
        title={onlineStatus.status}
      >
        {onlineStatus.isOnline && (
          <div className={cn(
            'absolute inset-0 rounded-full animate-ping',
            onlineStatus.badge,
            'opacity-75'
          )} />
        )}
      </div>
      
      {showStatus && (
        <span className={cn('text-xs font-medium', onlineStatus.statusColor)}>
          {onlineStatus.status}
        </span>
      )}
    </div>
  );
};