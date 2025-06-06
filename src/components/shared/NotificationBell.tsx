import React, { useState } from 'react';

import { Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { cn } from '@/lib/utils';
import { useGetUnreadCount } from '@/lib/react-query/notifications';
import { useUserContext } from '@/context/AuthContext';

interface NotificationBellProps {
  className?: string;
  dropdownPosition?: 'left' | 'right' | 'center';
}

const NotificationBell: React.FC<NotificationBellProps> = ({ 
  className = '',
  dropdownPosition = 'right'
}) => {
  const { user } = useUserContext();
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: unreadCount = 0, isLoading } = useGetUnreadCount(user.id);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const getDropdownPositionClass = () => {
    switch (dropdownPosition) {
      case 'left':
        return 'left-0';
      case 'center':
        return 'left-1/2 transform -translate-x-1/2';
      case 'right':
      default:
        return 'right-0';
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={toggleDropdown}
        className={cn(
          "relative p-2 rounded-lg transition-colors hover:bg-dark-3",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-1",
          isOpen && "bg-dark-3",
          className
        )}
        aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}
        title={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}
      >
        <Bell 
          className={cn(
            "w-5 h-5 transition-colors",
            isOpen ? "text-primary-500" : "text-light-3 hover:text-light-1"
          )} 
        />
        
        {/* Badge de notificações não lidas */}
        {!isLoading && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500/50 rounded-full animate-pulse" />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay para fechar quando clicar fora */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={closeDropdown}
          />
          
          {/* Dropdown Content */}
          <div className={cn(
            "absolute mt-2 z-50",
            getDropdownPositionClass()
          )}>
            <NotificationDropdown 
              onClose={closeDropdown} 
              position={dropdownPosition}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;