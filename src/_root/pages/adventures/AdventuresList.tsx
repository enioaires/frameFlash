import AdventureCard, { AdventureCardSkeleton } from '@/components/shared/AdventureCard';
import { Calendar, Filter, Globe, Lock, Plus, Search, Users } from 'lucide-react';
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
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');

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

    // Filtro por visibilidade
    if (visibilityFilter !== 'all') {
      filtered = filtered.filter((adventure) => {
        if (visibilityFilter === 'public') {
          return adventure.isPublic === true;
        } else if (visibilityFilter === 'private') {
          return adventure.isPublic !== true;
        }
        return true;
      });
    }

    // Usuários não-admin só veem aventuras ativas (públicas ou onde participam)
    if (!userIsAdmin) {
      filtered = filtered.filter((adventure) => adventure.status === 'active');
    }

    // Ordenar (ativas primeiro, depois públicas, depois por data)
    return [...filtered].sort((a, b) => {
      // Primeiro por status (ativas primeiro)
      if (a.status !== b.status) {
        return a.status === 'active' ? -1 : 1;
      }

      // Depois por visibilidade (públicas primeiro)
      if (a.isPublic !== b.isPublic) {
        return a.isPublic ? -1 : 1;
      }

      // Por último, por data de criação (mais recentes primeiro)
      return new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime();
    });
  }, [adventures?.documents, searchTerm, statusFilter, visibilityFilter, userIsAdmin]);

  const stats = React.useMemo(() => {
    if (!adventures?.documents) return { total: 0, active: 0, inactive: 0, public: 0, private: 0 };

    const total = adventures.documents.length;
    const active = adventures.documents.filter(a => a.status === 'active').length;
    const inactive = adventures.documents.filter(a => a.status === 'inactive').length;
    const publicAdventures = adventures.documents.filter(a => a.isPublic === true).length;
    const privateAdventures = adventures.documents.filter(a => a.isPublic !== true).length;

    return { total, active, inactive, public: publicAdventures, private: privateAdventures };
  }, [adventures?.documents]);

  if (isError) {
    return (
      <div className="flex flex-1">
        <div className="common-container">
        <HeaderBanner
            type="home"
            identifier={"main"}
            height="md"
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
            type="home"
            identifier={"main"}
            height="md"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full max-w-5xl">
          <div className="bg-dark-2 rounded-lg p-4 border border-dark-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-500/20 rounded-lg">
                <Users className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-light-1">{stats.total}</p>
                <p className="text-light-4 text-sm">Total</p>
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
                <p className="text-light-4 text-sm">Ativas</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-2 rounded-lg p-4 border border-dark-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Globe className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-light-1">{stats.public}</p>
                <p className="text-light-4 text-sm">Públicas</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-2 rounded-lg p-4 border border-dark-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Lock className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-light-1">{stats.private}</p>
                <p className="text-light-4 text-sm">Privadas</p>
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
                  <p className="text-light-4 text-sm">Inativas</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 w-full max-w-5xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <Filter className="w-4 h-4 text-light-4" />
            
            {/* Status Filter - apenas para admins */}
            {userIsAdmin && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-light-4">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="bg-dark-4 border-none rounded-md px-3 py-2 text-sm text-light-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="all">Todas</option>
                  <option value="active">Ativas</option>
                  <option value="inactive">Inativas</option>
                </select>
              </div>
            )}

            {/* Visibility Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-light-4">Visibilidade:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setVisibilityFilter('all')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    visibilityFilter === 'all'
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-4 text-light-3 hover:bg-dark-3'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setVisibilityFilter('public')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    visibilityFilter === 'public'
                      ? 'bg-blue-500 text-white'
                      : 'bg-dark-4 text-light-3 hover:bg-dark-3'
                  }`}
                >
                  <Globe className="w-3 h-3 inline mr-1" />
                  Públicas
                </button>
                <button
                  onClick={() => setVisibilityFilter('private')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    visibilityFilter === 'private'
                      ? 'bg-orange-500 text-white'
                      : 'bg-dark-4 text-light-3 hover:bg-dark-3'
                  }`}
                >
                  <Lock className="w-3 h-3 inline mr-1" />
                  Privadas
                </button>
              </div>
            </div>
          </div>
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
              {searchTerm || statusFilter !== 'all' || visibilityFilter !== 'all' ? (
                <>
                  <div className="p-4 bg-dark-3 rounded-full">
                    <Search className="w-8 h-8 text-light-4" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-light-1 mb-2">
                      Nenhuma aventura encontrada
                    </h3>
                    <p className="text-light-4 max-w-md">
                      Tente ajustar os filtros de busca, status ou visibilidade para encontrar aventuras.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setVisibilityFilter('all');
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
                      {userIsAdmin ? "Nenhuma aventura criada ainda" : "Nenhuma aventura disponível"}
                    </h3>
                    <p className="text-light-4 max-w-md">
                      {userIsAdmin
                        ? "Comece criando sua primeira aventura para organizar suas sessões de RPG."
                        : "Aguarde ser convidado para uma aventura ou procure aventuras públicas."
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
              {visibilityFilter !== 'all' && ` • ${visibilityFilter === 'public' ? 'Públicas' : 'Privadas'}`}
            </p>
          </div>
        )}

        {/* Filter Summary for Admins */}
        {userIsAdmin && filteredAdventures.length > 0 && (
          <div className="w-full max-w-5xl">
            <div className="mt-4 p-3 bg-dark-4/50 rounded-lg border border-dark-4">
              <p className="text-light-4 text-xs text-center">
                <span className="text-primary-500 font-medium">Admin:</span>
                {" "}Mostrando {filteredAdventures.length} aventuras
                • {filteredAdventures.filter(a => a.isPublic).length} públicas
                • {filteredAdventures.filter(a => !a.isPublic).length} privadas
                • {filteredAdventures.filter(a => a.status === 'active').length} ativas
              </p>
            </div>
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