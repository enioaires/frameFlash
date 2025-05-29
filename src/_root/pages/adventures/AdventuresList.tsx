import AdventureCard, { AdventureCardSkeleton } from '@/components/shared/AdventureCard';
import { Calendar, Filter, Plus, Search, Users } from 'lucide-react';
import React, { useState } from 'react';
import { useGetAdventureParticipants, useGetAdventures } from '@/lib/react-query/adventures';

import { Button } from '@/components/ui/button';
import HeaderBanner from '@/components/shared/HeaderBanner';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import Loader from '@/components/shared/Loader';
import type { Models } from 'appwrite';
import { isAdmin } from '@/lib/adventures';
import { useUserContext } from '@/context/AuthContext';

const AdventuresList = () => {
  const { user } = useUserContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const { data: adventures, isLoading, isError } = useGetAdventures();
  const userIsAdmin = isAdmin(user);

  // Filtrar e ordenar aventuras
  const filteredAdventures = React.useMemo(() => {
    if (!adventures?.documents) return [];

    let filtered = adventures.documents;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter((adventure) =>
        adventure.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        adventure.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((adventure) => adventure.status === statusFilter);
    }

    // Usuários não-admin só veem aventuras ativas
    if (!userIsAdmin) {
      filtered = filtered.filter((adventure) => adventure.status === 'active');
    }

    // Ordenar (ativas primeiro, depois por data)
    return [...filtered].sort((a, b) => {
      // Primeiro por status (ativas primeiro)
      if (a.status !== b.status) {
        return a.status === 'active' ? -1 : 1;
      }
      
      // Depois por data de criação (mais recentes primeiro)
      return new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime();
    });
  }, [adventures?.documents, searchTerm, statusFilter, userIsAdmin]);

  const stats = React.useMemo(() => {
    if (!adventures?.documents) return { total: 0, active: 0, inactive: 0 };

    const total = adventures.documents.length;
    const active = adventures.documents.filter(a => a.status === 'active').length;
    const inactive = adventures.documents.filter(a => a.status === 'inactive').length;

    return { total, active, inactive };
  }, [adventures?.documents]);

  if (isError) {
    return (
      <div className="flex flex-1">
        <div className="common-container">
          <HeaderBanner 
            title="Ops! Algo deu errado"
            subtitle="Não foi possível carregar as aventuras"
            height="sm"
          />
          <div className="flex-center flex-col gap-4">
            <p className="body-medium text-light-1">Erro ao carregar aventuras</p>
            <Loader text="Tentando reconectar..." />
          </div>
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
            title="🏰 Aventuras"
            subtitle={userIsAdmin ? "Gerencie todas as aventuras do sistema" : "Suas aventuras disponíveis"}
            height="md"
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
                <p className="text-light-4 text-sm">Total de Aventuras</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-2 rounded-lg p-4 border border-dark-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-light-1">{stats.active}</p>
                <p className="text-light-4 text-sm">Aventuras Ativas</p>
              </div>
            </div>
          </div>

          {userIsAdmin && (
            <div className="bg-dark-2 rounded-lg p-4 border border-dark-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-light-1">{stats.inactive}</p>
                  <p className="text-light-4 text-sm">Aventuras Inativas</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full max-w-5xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light-4" />
              <Input
                type="text"
                placeholder="Buscar aventuras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="shad-input pl-10"
              />
            </div>

            {/* Status Filter - apenas para admins */}
            {userIsAdmin && (
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-light-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="bg-dark-4 border-none rounded-md px-3 py-3 text-sm text-light-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="all">Todas</option>
                  <option value="active">Ativas</option>
                  <option value="inactive">Inativas</option>
                </select>
              </div>
            )}
          </div>

          {/* Create Button - apenas para admins */}
          {userIsAdmin && (
            <Link to="/adventures/create">
              <Button className="shad-button_primary">
                <Plus className="w-4 h-4 mr-2" />
                Nova Aventura
              </Button>
            </Link>
          )}
        </div>

        {/* Adventures Grid */}
        <div className="w-full max-w-5xl">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <AdventureCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredAdventures.length === 0 ? (
            <div className="flex-center flex-col gap-4 py-16">
              {searchTerm || statusFilter !== 'all' ? (
                <>
                  <div className="p-4 bg-dark-3 rounded-full">
                    <Search className="w-8 h-8 text-light-4" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-light-1 mb-2">
                      Nenhuma aventura encontrada
                    </h3>
                    <p className="text-light-4 max-w-md">
                      Tente ajustar os filtros de busca ou status para encontrar aventuras.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    variant="ghost"
                    className="text-primary-500 hover:text-primary-400"
                  >
                    Limpar filtros
                  </Button>
                </>
              ) : (
                <>
                  <div className="p-4 bg-dark-3 rounded-full">
                    <Users className="w-8 h-8 text-light-4" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-light-1 mb-2">
                      {userIsAdmin ? "Nenhuma aventura criada ainda" : "Você não está em nenhuma aventura"}
                    </h3>
                    <p className="text-light-4 max-w-md">
                      {userIsAdmin 
                        ? "Comece criando sua primeira aventura para organizar suas sessões de RPG."
                        : "Entre em contato com um mestre para ser adicionado a uma aventura."
                      }
                    </p>
                  </div>
                  {userIsAdmin && (
                    <Link to="/adventures/create">
                      <Button className="shad-button_primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeira Aventura
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAdventures.map((adventure) => (
                <AdventureCardWithParticipants 
                  key={adventure.$id} 
                  adventure={adventure} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Results Count */}
        {!isLoading && filteredAdventures.length > 0 && (
          <div className="w-full max-w-5xl">
            <p className="text-light-4 text-sm text-center">
              Exibindo {filteredAdventures.length} de {adventures?.documents.length || 0} aventuras
              {searchTerm && ` para "${searchTerm}"`}
              {statusFilter !== 'all' && ` com status "${statusFilter === 'active' ? 'ativa' : 'inativa'}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente auxiliar para buscar participantes
const AdventureCardWithParticipants: React.FC<{ adventure: Models.Document }> = ({ adventure }) => {
  const { data: participants } = useGetAdventureParticipants(adventure.$id);
  
  return (
    <AdventureCard 
      adventure={adventure} 
      participantCount={participants?.documents.length || 0}
    />
  );
};

export default AdventuresList;