import EmptyState, { LoadingState } from "@/components/shared/EmptyState";
import { Filter, Globe, Lock, Users } from "lucide-react";
import { useAdventureFiltering, usePostFiltering } from "@/hooks/useFiltering";

import { CompactAdventureSelect } from "@/components/shared/AdventureSelect";
import HeaderBanner from "@/components/shared/HeaderBanner";
import { Models } from "appwrite";
import PostCard from "@/components/shared/PostCard";
import { useGetRecentPosts } from "@/lib/react-query/posts";
import { useGetUsers } from "@/lib/react-query/user";
import { useState } from "react";

const Home = () => {
  const [selectedAdventure, setSelectedAdventure] = useState<string>("");
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');

  // Sistema de filtragem por aventuras
  const {
    activeUserAdventures,
    publicAdventures, // 🆕 NOVO
    hasAdventures,
    isAdmin,
    isLoading: isLoadingAdventures
  } = useAdventureFiltering();

  // Posts e usuários
  const {
    data: allPosts,
    isLoading: isPostLoading,
    isError: isErrorPosts,
  } = useGetRecentPosts();

  const {
    isError: isErrorCreators,
  } = useGetUsers(10);

  // 🆕 CORRIGIDO: Filtragem de posts que inclui públicos
  const { filteredPosts, stats } = usePostFiltering(allPosts?.documents || []);

  // Aplicar filtros adicionais
  let finalPosts = filteredPosts;

  // Filtro por aventura específica
  if (selectedAdventure) {
    finalPosts = finalPosts.filter((post: Models.Document) =>
      post.adventures && post.adventures.includes(selectedAdventure)
    );
  }

  // Filtro por visibilidade
  if (visibilityFilter !== 'all') {
    finalPosts = finalPosts.filter((post: Models.Document) => {
      const isPublicPost = !post.adventures || post.adventures.length === 0;

      if (visibilityFilter === 'public') {
        return isPublicPost;
      } else if (visibilityFilter === 'private') {
        return !isPublicPost;
      }

      return true;
    });
  }

  // Encontrar aventura selecionada
  const selectedAdventureData = activeUserAdventures.find(
    adventure => adventure.$id === selectedAdventure
  );

  // 🆕 NOVO: Verificar se usuário tem acesso a conteúdo
  const hasAccessToContent = isAdmin || 
                            hasAdventures || 
                            publicAdventures.length > 0 || 
                            stats.publicPosts > 0;

  // Estados de erro
  if (isErrorPosts || isErrorCreators) {
    return (
      <div className="flex flex-1">
        <div className="flex flex-col flex-1 items-center gap-10 overflow-scroll py-10 px-5 md:px-8 lg:p-14 custom-scrollbar">
          <div className="w-full max-w-7xl">
            <HeaderBanner
              type="home"
              identifier={"main"}
              height="lg"
            />
          </div>
          <EmptyState
            type="empty"
            title="Erro ao carregar conteúdo"
            description="Algo deu errado ao carregar os posts. Tente recarregar a página."
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="flex flex-col flex-1 items-center gap-10 overflow-scroll py-10 px-5 md:px-8 lg:p-14 custom-scrollbar">
        <div className="w-full max-w-7xl">
          <HeaderBanner
            type="home"
            identifier={"main"}
            height="lg"
          />
        </div>

        <div className="home-posts">
          {/* Header com filtros */}
          <div className="flex flex-col gap-4 w-full mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="h3-bold md:h2-bold text-left">Publicações Recentes</h2>

              {/* Filtro por aventura - só mostra se há aventuras */}
              {(activeUserAdventures.length > 0 || publicAdventures.length > 0) && (
                <CompactAdventureSelect
                  adventures={[...activeUserAdventures, ...publicAdventures]}
                  value={selectedAdventure}
                  onChange={setSelectedAdventure}
                  className="w-full sm:w-64"
                />
              )}
            </div>

            {/* Filtros de Visibilidade */}
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-light-4" />
              <div className="flex gap-2">
                <button
                  onClick={() => setVisibilityFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${visibilityFilter === 'all'
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-4 text-light-3 hover:bg-dark-3'
                    }`}
                >
                  <Users className="w-3 h-3 inline mr-1" />
                  Todos
                </button>
                <button
                  onClick={() => setVisibilityFilter('public')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${visibilityFilter === 'public'
                      ? 'bg-blue-500 text-white'
                      : 'bg-dark-4 text-light-3 hover:bg-dark-3'
                    }`}
                >
                  <Globe className="w-3 h-3 inline mr-1" />
                  Públicos
                </button>
                <button
                  onClick={() => setVisibilityFilter('private')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${visibilityFilter === 'private'
                      ? 'bg-orange-500 text-white'
                      : 'bg-dark-4 text-light-3 hover:bg-dark-3'
                    }`}
                >
                  <Lock className="w-3 h-3 inline mr-1" />
                  Restritos
                </button>
              </div>
            </div>
          </div>

          {/* Conteúdo principal */}
          {isPostLoading || isLoadingAdventures ? (
            <LoadingState text="Carregando posts..." />
          ) : finalPosts.length === 0 ? (
            selectedAdventure ? (
              <EmptyState
                type="no_results"
                title="Nenhum post nesta aventura"
                description={`Ainda não há posts na aventura "${selectedAdventureData?.title}".`}
              >
                <button
                  onClick={() => setSelectedAdventure("")}
                  className="text-primary-500 hover:text-primary-400 transition-colors underline"
                >
                  Ver posts de todas as aventuras
                </button>
              </EmptyState>
            ) : visibilityFilter !== 'all' ? (
              <EmptyState
                type="no_results"
                title={`Nenhum post ${visibilityFilter === 'public' ? 'público' : 'restrito'}`}
                description={`Não encontramos posts ${visibilityFilter === 'public' ? 'públicos' : 'restritos'} no momento.`}
              >
                <button
                  onClick={() => setVisibilityFilter('all')}
                  className="text-primary-500 hover:text-primary-400 transition-colors underline"
                >
                  Ver todos os posts
                </button>
              </EmptyState>
            ) : (
              // 🆕 CORRIGIDO: Não mostrar "NoAdventuresState" se há posts públicos
              <EmptyState
                type="no_posts"
                title="Nenhum post encontrado"
                description={hasAccessToContent 
                  ? "Ainda não há posts disponíveis para você." 
                  : "Não há posts públicos disponíveis no momento. Entre em contato com um mestre para ser adicionado a uma aventura."
                }
                icon="📝"
                showContactInfo={!hasAccessToContent}
              />
            )
          ) : (
            <ul className="flex flex-col flex-1 gap-9 w-full">
              {finalPosts.map((post: Models.Document) => (
                <li key={post.$id} className="flex justify-center w-full">
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          )}

          {/* Indicadores de filtro ativo */}
          {(selectedAdventure || visibilityFilter !== 'all') && finalPosts.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-6 p-3 bg-dark-3 rounded-lg border border-dark-4">
              <p className="text-light-4 text-sm text-center">
                Exibindo {finalPosts.length} post{finalPosts.length !== 1 ? 's' : ''}
                {selectedAdventure && (
                  <span className="text-primary-500 font-medium ml-1">
                    de "{selectedAdventureData?.title}"
                  </span>
                )}
                {visibilityFilter !== 'all' && (
                  <span className={`font-medium ml-1 ${visibilityFilter === 'public' ? 'text-blue-400' : 'text-orange-400'
                    }`}>
                    • {visibilityFilter === 'public' ? 'Públicos' : 'Restritos'}
                  </span>
                )}
              </p>
              {(selectedAdventure || visibilityFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedAdventure("");
                    setVisibilityFilter('all');
                  }}
                  className="text-primary-500 hover:text-primary-400 text-sm underline ml-2"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}

          {/* Stats de filtragem para admins */}
          {isAdmin && allPosts?.documents && (
            <div className="mt-6 p-4 bg-dark-4/50 rounded-lg border border-dark-4">
              <p className="text-light-4 text-xs text-center mb-2">
                <span className="text-primary-500 font-medium">Admin - Estatísticas:</span>
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-light-1">{stats.totalPosts}</p>
                  <p className="text-xs text-light-4">Total</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-400">{stats.visiblePosts}</p>
                  <p className="text-xs text-light-4">Visíveis</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-400">{stats.publicPosts}</p>
                  <p className="text-xs text-light-4">Públicos</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-cyan-400">{stats.publicAdventurePosts}</p>
                  <p className="text-xs text-light-4">Aventuras Públicas</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-orange-400">{stats.privatePosts}</p>
                  <p className="text-xs text-light-4">Privados</p>
                </div>
              </div>
            </div>
          )}

          {/* 🆕 NOVO: Informações sobre aventuras públicas disponíveis */}
          {!isAdmin && publicAdventures.length > 0 && (
            <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <h3 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Aventuras Públicas Disponíveis
              </h3>
              <p className="text-light-4 text-sm mb-3">
                Estas aventuras estão abertas para todos verem posts:
              </p>
              <div className="flex flex-wrap gap-2">
                {publicAdventures.slice(0, 3).map((adventure) => (
                  <div key={adventure.$id} className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 rounded-full text-sm">
                    <img
                      src={adventure.imageUrl || '/assets/icons/profile-placeholder.svg'}
                      alt={adventure.title}
                      className="w-4 h-4 rounded object-cover"
                    />
                    <span className="text-blue-300">{adventure.title}</span>
                  </div>
                ))}
                {publicAdventures.length > 3 && (
                  <span className="text-blue-400 text-sm py-1.5">
                    +{publicAdventures.length - 3} mais
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;