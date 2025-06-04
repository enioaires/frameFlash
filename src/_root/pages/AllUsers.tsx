import { Crown, Filter, Search, Users } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import EmptyState from '@/components/shared/EmptyState';
import HeaderBanner from '@/components/shared/HeaderBanner';
import { Input } from '@/components/ui/input';
import UserCard from '@/components/shared/UserCard';
import { UserLoader } from '@/components/shared/Loader';
import { isAdmin } from '@/lib/adventures';
import { useGetUsers } from '@/lib/react-query/user';
import { useUserContext } from '@/context/AuthContext';

const AllUsers = () => {
  const { user } = useUserContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');

  const { data: allUsers, isLoading, isError } = useGetUsers();
  const userIsAdmin = isAdmin(user);

  // Filtrar usuários baseado na busca e role
  const filteredUsers = React.useMemo(() => {
    if (!allUsers?.documents) return [];

    let filtered = allUsers.documents;

    // Filtro por termo de busca
    if (searchTerm) {
      const normalizedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((userData) =>
        userData.name.toLowerCase().includes(normalizedSearch) ||
        userData.username.toLowerCase().includes(normalizedSearch) ||
        userData.email.toLowerCase().includes(normalizedSearch)
      );
    }

    // Filtro por role (apenas para admins)
    if (roleFilter !== 'all' && userIsAdmin) {
      filtered = filtered.filter((userData) => userData.role === roleFilter);
    }

    // Ordenar: admins primeiro, depois por nome
    return [...filtered].sort((a, b) => {
      // Primeiro por role (admins primeiro)
      if (a.role !== b.role) {
        return a.role === 'admin' ? -1 : 1;
      }
      
      // Depois por nome alfabético
      return a.name.localeCompare(b.name);
    });
  }, [allUsers?.documents, searchTerm, roleFilter, userIsAdmin]);

  // Estatísticas
  const stats = React.useMemo(() => {
    if (!allUsers?.documents) return { total: 0, admins: 0, users: 0 };

    const total = allUsers.documents.length;
    const admins = allUsers.documents.filter(u => u.role === 'admin').length;
    const users = allUsers.documents.filter(u => u.role === 'user').length;

    return { total, admins, users };
  }, [allUsers?.documents]);

  // Estados de erro
  if (isError) {
    return (
      <div className="flex flex-1">
        <div className="common-container">
          <HeaderBanner
            type="home"
            identifier="main"
            height="lg"
          />
          <EmptyState
            type="empty"
            title="Erro ao carregar usuários"
            description="Algo deu errado ao carregar os usuários. Tente recarregar a página."
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="common-container">
        {/* Header Banner */}
        <div className="w-full max-w-6xl">
          <HeaderBanner
            type="home"
            identifier="main"
            height="lg"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
          <div className="bg-dark-2 rounded-lg p-4 border border-dark-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-500/20 rounded-lg">
                <Users className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-light-1">{stats.total}</p>
                <p className="text-light-4 text-sm">Total de Usuários</p>
              </div>
            </div>
          </div>

          {userIsAdmin && (
            <>
              <div className="bg-dark-2 rounded-lg p-4 border border-dark-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Crown className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-light-1">{stats.admins}</p>
                    <p className="text-light-4 text-sm">Administradores</p>
                  </div>
                </div>
              </div>

              <div className="bg-dark-2 rounded-lg p-4 border border-dark-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-light-1">{stats.users}</p>
                    <p className="text-light-4 text-sm">Usuários Comuns</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 w-full max-w-5xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="h3-bold md:h2-bold text-left">
              {userIsAdmin ? 'Gerenciar Usuários' : 'Comunidade'}
            </h2>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light-4" />
              <Input
                type="text"
                placeholder="Buscar por nome, username ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="shad-input pl-10"
              />
            </div>
          </div>

          {/* Filters - apenas para admins */}
          {userIsAdmin && (
            <div className="flex flex-wrap items-center gap-4">
              <Filter className="w-4 h-4 text-light-4" />
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-light-4">Filtrar por:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setRoleFilter('all')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      roleFilter === 'all'
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-4 text-light-3 hover:bg-dark-3'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setRoleFilter('admin')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      roleFilter === 'admin'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-dark-4 text-light-3 hover:bg-dark-3'
                    }`}
                  >
                    <Crown className="w-3 h-3 inline mr-1" />
                    Admins
                  </button>
                  <button
                    onClick={() => setRoleFilter('user')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      roleFilter === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-dark-4 text-light-3 hover:bg-dark-3'
                    }`}
                  >
                    <Users className="w-3 h-3 inline mr-1" />
                    Usuários
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Users Grid */}
        <div className="w-full max-w-5xl">
          {isLoading ? (
            <UserLoader count={12} />
          ) : filteredUsers.length === 0 ? (
            <div className="flex-center flex-col gap-4 py-16">
              {searchTerm || roleFilter !== 'all' ? (
                <>
                  <div className="p-4 bg-dark-3 rounded-full">
                    <Search className="w-8 h-8 text-light-4" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-light-1 mb-2">
                      Nenhum usuário encontrado
                    </h3>
                    <p className="text-light-4 max-w-md">
                      Tente ajustar os termos de busca ou filtros para encontrar usuários.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setRoleFilter('all');
                    }}
                    variant="ghost"
                    className="text-primary-500 hover:text-primary-400"
                  >
                    Limpar filtros
                  </Button>
                </>
              ) : (
                <EmptyState
                  type="empty"
                  title="Nenhum usuário encontrado"
                  description="Ainda não há usuários cadastrados na plataforma."
                  icon="👥"
                />
              )}
            </div>
          ) : (
            <ul className="user-grid">
              {filteredUsers.map((userData) => (
                <li key={userData.$id} className="flex-1 min-w-[200px] w-full">
                  <UserCard user={userData} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Results Count */}
        {!isLoading && filteredUsers.length > 0 && (
          <div className="w-full max-w-5xl">
            <div className="flex items-center justify-center gap-2 p-3 bg-dark-3 rounded-lg border border-dark-4">
              <p className="text-light-4 text-sm text-center">
                Exibindo {filteredUsers.length} de {allUsers?.documents.length || 0} usuários
                {searchTerm && ` para "${searchTerm}"`}
                {roleFilter !== 'all' && userIsAdmin && ` • ${roleFilter === 'admin' ? 'Administradores' : 'Usuários comuns'}`}
              </p>
              {(searchTerm || roleFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('all');
                  }}
                  className="text-primary-500 hover:text-primary-400 text-sm underline ml-2"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllUsers;