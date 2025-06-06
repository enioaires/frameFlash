import { Heart, MessageCircle, Reply, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Models } from 'appwrite';
import React from 'react';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/lib/utils';
import { useGetUsers } from '@/lib/react-query/user';
import { useNavigate } from 'react-router-dom';
import { useNotificationActions } from '@/lib/react-query/notifications';
import { useToast } from '@/components/ui/use-toast';
import { useUserContext } from '@/context/AuthContext';

interface NotificationItemProps {
  notification: Models.Document;
  compact?: boolean;
  onRead?: () => void;
  onClick?: () => void;
  showActions?: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  compact = false,
  onRead,
  onClick,
  showActions = false
}) => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: usersData } = useGetUsers();
  const { markAsRead, deleteNotification, isLoading } = useNotificationActions();

  // Buscar dados do usuário que triggou a notificação
  const triggerUser = usersData?.documents.find(u => u.$id === notification.triggerUserId);

  const handleClick = () => {
    // Marcar como lida se não está lida
    if (!notification.isRead) {
      markAsRead({ 
        notificationId: notification.$id, 
        userId: user.id 
      });
      onRead?.();
    }

    // Navegar para o conteúdo relacionado
    if (notification.postId) {
      if (notification.commentId) {
        // Para comentários, ir para o post com foco no comentário
        navigate(`/posts/${notification.postId}#comment-${notification.commentId}`);
      } else {
        // Para likes, ir direto para o post
        navigate(`/posts/${notification.postId}`);
      }
    }

    onClick?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    deleteNotification({ 
      notificationId: notification.$id, 
      userId: user.id 
    }, {
      onSuccess: () => {
        toast({
          title: "Notificação removida",
          description: "A notificação foi removida com sucesso."
        });
      },
      onError: () => {
        toast({
          title: "Erro",
          description: "Não foi possível remover a notificação."
        });
      }
    });
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" fill="currentColor" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'reply':
        return <Reply className="w-4 h-4 text-green-500" />;
      default:
        return <MessageCircle className="w-4 h-4 text-primary-500" />;
    }
  };

  const getNotificationColor = () => {
    switch (notification.type) {
      case 'like':
        return 'border-red-500/20 bg-red-500/5';
      case 'comment':
        return 'border-blue-500/20 bg-blue-500/5';
      case 'reply':
        return 'border-green-500/20 bg-green-500/5';
      default:
        return 'border-primary-500/20 bg-primary-500/5';
    }
  };

  if (!triggerUser) {
    // Skeleton loading para quando dados do usuário não carregaram
    return (
      <div className={cn(
        "p-4 animate-pulse",
        compact ? "min-h-[60px]" : "min-h-[80px]"
      )}>
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-dark-3 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-dark-3 rounded w-3/4" />
            <div className="h-3 bg-dark-3 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        "relative p-4 cursor-pointer transition-all duration-200",
        "hover:bg-dark-3/50 border-l-4",
        !notification.isRead ? getNotificationColor() : "border-transparent",
        !notification.isRead && "bg-dark-3/30",
        compact ? "py-3" : "py-4"
      )}
    >
      <div className="flex gap-3">
        {/* Avatar do usuário */}
        <div className="relative flex-shrink-0">
          <img
            src={triggerUser.imageUrl || '/assets/icons/profile-placeholder.svg'}
            alt={triggerUser.name}
            className={cn(
              "rounded-full object-cover",
              compact ? "w-8 h-8" : "w-10 h-10"
            )}
          />
          
          {/* Ícone do tipo de notificação */}
          <div className="absolute -bottom-1 -right-1 p-1 bg-dark-2 rounded-full border border-dark-4">
            {getNotificationIcon()}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* Mensagem */}
              <p className={cn(
                "text-light-1 leading-relaxed",
                compact ? "text-sm" : "text-sm",
                !notification.isRead && "font-medium"
              )}>
                <span className="font-semibold text-primary-500">
                  {triggerUser.name}
                </span>
                {" "}
                {notification.message.replace(triggerUser.name, '').trim()}
              </p>

              {/* Timestamp */}
              <p className={cn(
                "text-light-4 mt-1",
                compact ? "text-xs" : "text-xs"
              )}>
                {timeAgo(notification.$createdAt)}
                {!notification.isRead && (
                  <span className="ml-2 inline-flex w-2 h-2 bg-primary-500 rounded-full" />
                )}
              </p>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  onClick={handleDelete}
                  disabled={isLoading}
                  variant="ghost"
                  size="sm"
                  className="text-light-4 hover:text-red-400 h-8 w-8 p-0"
                  title="Remover notificação"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Indicador de não lida (sutil) */}
      {!notification.isRead && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
      )}
    </div>
  );
};

export default NotificationItem;