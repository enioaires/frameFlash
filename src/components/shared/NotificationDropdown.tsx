import { Bell, Check, ExternalLink } from 'lucide-react';
import { useGetNotifications, useNotificationActions } from '@/lib/react-query/notifications';

import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Loader from './Loader';
import NotificationItem from './NotificationItem';
import React from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useUserContext } from '@/context/AuthContext';

interface NotificationDropdownProps {
  onClose: () => void;
  position?: 'left' | 'right' | 'center';
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ 
  onClose, 
  position = 'right' 
}) => {
  const { user } = useUserContext();
  const { toast } = useToast();
  
  const { data: notifications, isLoading, error } = useGetNotifications(user.id, 5);
  const { markAllAsRead, isLoading: isMarkingAllRead } = useNotificationActions();

  const handleMarkAllAsRead = () => {
    markAllAsRead(user.id, {
      onSuccess: (result) => {
        if (result.count > 0) {
          toast({
            title: "Notificações marcadas como lidas",
            description: `${result.count} notificação${result.count !== 1 ? 'ões' : ''} marcada${result.count !== 1 ? 's' : ''} como lida${result.count !== 1 ? 's' : ''}.`
          });
        }
      },
      onError: () => {
        toast({
          title: "Erro",
          description: "Não foi possível marcar as notificações como lidas."
        });
      }
    });
  };

  const recentNotifications = notifications?.documents || [];
  const unreadNotifications = recentNotifications.filter(n => !n.isRead);

  // Classes de posicionamento baseadas na prop position
  const getPositionClasses = () => {
    switch (position) {
      case 'left':
        return 'left-0 origin-top-left';
      case 'center':
        return 'left-1/2 transform -translate-x-1/2 origin-top';
      case 'right':
      default:
        return 'right-0 origin-top-right';
    }
  };

  return (
    <div 
    className={cn(
      "bg-dark-2 border border-dark-4 rounded-xl shadow-2xl overflow-hidden",
      // Classes base
      "w-[95vw] sm:w-96",
      // Mobile: centralizado na tela
      "fixed top-[200px] left-1/2 -translate-x-1/2 -translate-y-1/2",
      // Desktop: posicionamento normal
      "sm:static sm:translate-x-0 sm:translate-y-0",
      // Desktop: posicionamento específico
      "sm:" + getPositionClasses(),
    )}
    style={{
      maxWidth: position === 'left' ? 'calc(100vw - 20px)' : undefined,
      zIndex: 50
    }}
  >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-4 bg-dark-1/50">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary-500" />
          <h3 className="font-semibold text-light-1">Notificações</h3>
          {unreadNotifications.length > 0 && (
            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
              {unreadNotifications.length} nova{unreadNotifications.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Marcar todas como lidas */}
        {unreadNotifications.length > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAllRead}
            variant="ghost"
            size="sm"
            className="text-xs text-primary-500 hover:text-primary-400 h-auto p-2"
            title="Marcar todas como lidas"
          >
            {isMarkingAllRead ? (
              <Loader size="sm" />
            ) : (
              <Check className="w-3 h-3" />
            )}
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="p-6">
            <Loader text="Carregando notificações..." />
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <div className="p-3 bg-red-500/10 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <Bell className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-light-4 text-sm">
              Erro ao carregar notificações
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="ghost"
              size="sm"
              className="text-primary-500 hover:text-primary-400 mt-2"
            >
              Tentar novamente
            </Button>
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="p-6 text-center">
            <div className="p-3 bg-dark-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <Bell className="w-6 h-6 text-light-4" />
            </div>
            <p className="text-light-4 text-sm mb-1">
              Nenhuma notificação ainda
            </p>
            <p className="text-light-4 text-xs">
              Você será notificado quando alguém interagir com seus posts
            </p>
          </div>
        ) : (
          <div className="divide-y divide-dark-4">
            {recentNotifications.map((notification) => (
              <NotificationItem
                key={notification.$id}
                notification={notification}
                compact={true}
                onRead={() => {
                  // Item será atualizado automaticamente via React Query
                }}
                onClick={onClose} // Fechar dropdown quando clicar no item
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {recentNotifications.length > 0 && (
        <div className="p-3 border-t border-dark-4 bg-dark-1/30">
          <Link
            to="/notifications"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2 text-sm text-primary-500 hover:text-primary-400 transition-colors group"
          >
            <span>Ver todas as notificações</span>
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;