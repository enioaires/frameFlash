import EmptyState, { LoadingState } from "@/components/shared/EmptyState";
import { useAdventureFiltering, usePostFiltering } from "@/hooks/useFiltering";

import BackToTopButton from "@/components/shared/BackToTopButton";
import HeaderBanner from "@/components/shared/HeaderBanner";
import { Models } from "appwrite";
import PostCard from "@/components/shared/PostCard";
import SearchInput from "@/components/shared/SearchInput";
import { useGetRecentPosts } from "@/lib/react-query/posts";
import { useGetUsers } from "@/lib/react-query/user";
import { useState } from "react";

const Home = () => {
  const [selectedAdventure, setSelectedAdventure] = useState<string>("");
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Sistema de filtragem por aventuras
  const {
    activeUserAdventures,
    publicAdventures,
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

  // Filtragem de posts que inclui públicos
  const { filteredPosts, stats } = usePostFiltering(allPosts?.documents || []);

  // Aplicar busca
  let searchFilteredPosts = filteredPosts;
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    searchFilteredPosts = filteredPosts.filter(post => {
      const title = post.title?.toLowerCase() || '';
      const captions = Array.isArray(post.captions)
        ? post.captions.join(' ').toLowerCase()
        : (post.captions || '').toLowerCase();
      const tags = post.tags?.join(' ').toLowerCase() || '';

      return title.includes(term) || captions.includes(term) || tags.includes(term);
    });
  }

  // Aplicar filtros adicionais
  let finalPosts = searchFilteredPosts;

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

  // Verificar se usuário tem acesso a conteúdo
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
            </div>

            {/* Input de Busca */}
            <div className="w-full max-w-md">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar posts por título, legenda ou tags..."
              />
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
                  onClick={() => {
                    setSelectedAdventure("");
                    setSearchTerm("");
                  }}
                  className="text-primary-500 hover:text-primary-400 transition-colors underline"
                >
                  Ver posts de todas as aventuras
                </button>
              </EmptyState>
            ) : searchTerm ? (
              <EmptyState
                type="no_results"
                title="Nenhum post encontrado"
                description={`Sua busca por "${searchTerm}" não retornou resultados.`}
              >
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-primary-500 hover:text-primary-400 transition-colors underline"
                >
                  Limpar busca
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
                <li key={post.$id}>
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          )}

          {/* Indicadores de filtro ativo */}
          {(selectedAdventure || visibilityFilter !== 'all' || searchTerm) && finalPosts.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-6 p-3 bg-dark-3 rounded-lg border border-dark-4">
              <p className="text-light-4 text-sm text-center">
                Exibindo {finalPosts.length} post{finalPosts.length !== 1 ? 's' : ''}
                {searchTerm && (
                  <span className="text-blue-400 font-medium ml-1">
                    para "{searchTerm}"
                  </span>
                )}
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
              {(selectedAdventure || visibilityFilter !== 'all' || searchTerm) && (
                <button
                  onClick={() => {
                    setSelectedAdventure("");
                    setVisibilityFilter('all');
                    setSearchTerm("");
                  }}
                  className="text-primary-500 hover:text-primary-400 text-sm underline ml-2"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}
        </div>
        <BackToTopButton postsCount={finalPosts.length} />
      </div>
    </div>
  );
};

export default Home;