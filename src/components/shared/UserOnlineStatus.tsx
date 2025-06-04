import { Clock, Wifi, WifiOff } from 'lucide-react';
import { formatLastSeen, getOnlineStatus } from '@/lib/utils';

import React from 'react';
import { cn } from '@/lib/utils';

interface UserOnlineStatusProps {
  lastSeen?: string;
  variant?: 'badge' | 'full' | 'compact';
  className?: string;
}

export const UserOnlineStatus: React.FC<UserOnlineStatusProps> = ({
  lastSeen,
  variant = 'compact',
  className = ''
}) => {
  if (!lastSeen) {
    return (
      <div className={cn('flex items-center gap-1 text-gray-500', className)}>
        <WifiOff className="w-3 h-3" />
        <span className="text-xs">Nunca visto</span>
      </div>
    );
  }

  const onlineStatus = getOnlineStatus(lastSeen);

  if (variant === 'badge') {
    return (
      <span className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
        onlineStatus.isOnline 
          ? 'bg-green-500/20 text-green-400' 
          : 'bg-gray-500/20 text-gray-400',
        className
      )}>
        {onlineStatus.isOnline ? (
          <Wifi className="w-3 h-3" />
        ) : (
          <Clock className="w-3 h-3" />
        )}
        {onlineStatus.status}
      </span>
    );
  }

  if (variant === 'full') {
    return (
      <div className={cn('flex flex-col gap-1', className)}>
        <div className="flex items-center gap-2">
          {onlineStatus.isOnline ? (
            <Wifi className="w-4 h-4 text-green-400" />
          ) : (
            <Clock className="w-4 h-4 text-gray-400" />
          )}
          <span className={cn('font-medium', onlineStatus.statusColor)}>
            {onlineStatus.status}
          </span>
        </div>
        <p className="text-xs text-light-4">
          {formatLastSeen(lastSeen)}
        </p>
      </div>
    );
  }

  // variant === 'compact'
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {onlineStatus.isOnline ? (
        <Wifi className="w-3 h-3 text-green-400" />
      ) : (
        <Clock className="w-3 h-3 text-gray-400" />
      )}
      <span className={cn('text-xs', onlineStatus.statusColor)}>
        {onlineStatus.status}
      </span>
    </div>
  );
};