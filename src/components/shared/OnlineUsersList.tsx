import { Clock, Crown, Filter, User, Users, Wifi } from 'lucide-react';
import React, { useState } from 'react';
import { formatLastSeen, getOnlineStatus } from '@/lib/utils';

import { Link } from 'react-router-dom';
import Loader from './Loader';
import { OnlineIndicator } from './OnlineIndicator';
import { UserOnlineStatus } from './UserOnlineStatus';
import { cn } from '@/lib/utils';
import { useGetUsersWithLastSeen } from '@/lib/react-query/user';

export const OnlineUsersList: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all');
  const { data: users, isLoading, refetch } = useGetUsersWithLastSeen();

  const filteredUsers = React.useMemo(() => {
    if (!users?.documents) return [];

    return users.documents.filter(user => {
      if (!user.lastSeen && filter === 'online') return false;
      if (!user.lastSeen && filter === 'offline') return true;
      if (!user.lastSeen) return filter === 'all';

      const status = getOnlineStatus(user.lastSeen);
      
      if (filter === 'online') return status.isOnline;
      if (filter === 'offline') return !status.isOnline;
      
      return true;
    }).sort((a, b) => {
      // Ordenar por status online primeiro
      const aOnline = a.lastSeen ? getOnlineStatus(a.lastSeen).isOnline : false;
      const bOnline = b.lastSeen ? getOnlineStatus(b.lastSeen).isOnline : false;
      
      if (aOnline !== bOnline) {
        return aOnline ? -1 : 1;
      }
      
      // Depois por data de lastSeen mais recente
      if (a.lastSeen && b.lastSeen) {
        return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
      }
      
      // Por último, por nome
      return a.name.localeCompare(b.name);
    });
  }, [users?.documents, filter]);

  const stats = React.useMemo(() => {
    if (!users?.documents) return { total: 0, online: 0, offline: 0 };

    const total = users.documents.length;
    const online = users.documents.filter(user => {
      if (!user.lastSeen) return false;
      return getOnlineStatus(user.lastSeen).isOnline;
    }).length;
    const offline = total - online;

    return { total, online, offline };
  }, [users?.documents]);

  // Auto-refresh a cada 30 segundos
  React.useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  if (isLoading) {
    return <Loader text="Carregando usuários..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header com Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-light-1">Status dos Usuários</h3>
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-400">{stats.online}</span>
          </div>
          <span className="text-gray-400">•</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-light-4">{stats.offline}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-light-4" />
        <div className="flex gap-2">
          {(['all', 'online', 'offline'] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                filter === filterOption
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-4 text-light-3 hover:bg-dark-3'
              )}
            >
              {filterOption === 'all' && (
                <>
                  <Users className="w-4 h-4" />
                  Todos ({stats.total})
                </>
              )}
              {filterOption === 'online' && (
                <>
                  <Wifi className="w-4 h-4" />
                  Online ({stats.online})
                </>
              )}
              {filterOption === 'offline' && (
                <>
                  <Clock className="w-4 h-4" />
                  Offline ({stats.offline})
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 bg-dark-3 rounded-lg border border-dark-4">
            <div className="p-4 bg-dark-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              {filter === 'online' && <Wifi className="w-8 h-8 text-light-4" />}
              {filter === 'offline' && <Clock className="w-8 h-8 text-light-4" />}
              {filter === 'all' && <Users className="w-8 h-8 text-light-4" />}
            </div>
            <p className="text-light-4 text-sm">
              {filter === 'online' && 'Nenhum usuário online no momento'}
              {filter === 'offline' && 'Todos os usuários estão online!'}
              {filter === 'all' && 'Nenhum usuário encontrado'}
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <Link
              key={user.$id}
              to={`/profile/${user.$id}`}
              className="block"
            >
              <div className="flex items-center gap-4 p-4 bg-dark-3 rounded-lg hover:bg-dark-2 transition-colors border border-dark-4 hover:border-primary-500/50">
                <div className="relative flex-shrink-0">
                  <img
                    src={user.imageUrl || '/assets/icons/profile-placeholder.svg'}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <OnlineIndicator
                    lastSeen={user.lastSeen}
                    size="md"
                    position="bottom-right"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-light-1 truncate">
                      {user.name}
                    </h4>
                    <div className="flex items-center gap-1">
                      {user.role === 'admin' && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                      {user.role === 'user' && (
                        <User className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-light-3 mb-2">
                    @{user.username}
                  </p>

                  <UserOnlineStatus
                    lastSeen={user.lastSeen}
                    variant="full"
                  />
                </div>

                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-light-4">
                    {user.lastSeen ? formatLastSeen(user.lastSeen) : 'Nunca visto'}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Auto-refresh indicator */}
      <div className="text-center">
        <p className="text-xs text-light-4 flex items-center justify-center gap-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          Atualizando automaticamente a cada 30s
        </p>
      </div>
    </div>
  );
};