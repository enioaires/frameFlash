import LazyPostCard, { PostCardSkeleton } from "@/components/shared/LazyPostCard";
import { Suspense, useRef, useState } from "react";
import { useAdventureFiltering, usePostFiltering } from "@/hooks/useFiltering";

import BackToTopButton from "@/components/shared/BackToTopButton";
import EmptyState from "@/components/shared/EmptyState";
import HeaderBanner from "@/components/shared/HeaderBanner";
import PaginationInfo from "@/components/shared/PaginationInfo";
import SearchInput from "@/components/shared/SearchInput";
import { useDebouncedSearch } from "@/hooks/useDebounce";
import { useGetRecentPostsPaginated } from "@/lib/react-query/posts";

const Home = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');
  
  const postsStartRef = useRef<HTMLDivElement>(null);

  const {
    hasAdventures,
    isAdmin,
    isLoading: isLoadingAdventures
  } = useAdventureFiltering();

  const {
    data: postsData,
    isLoading: isPostLoading,
    isError: isErrorPosts,
  } = useGetRecentPostsPaginated(currentPage, 10);

  const { filteredPosts } = usePostFiltering(postsData?.documents || []);
  
  const { searchResults, isSearching } = useDebouncedSearch(
    searchTerm, 
    filteredPosts, 
    300
  );

  const finalPosts = visibilityFilter === 'all' 
    ? searchResults 
    : searchResults.filter(post => {
        const isPublicPost = !post.adventures || post.adventures.length === 0;
        return visibilityFilter === 'public' ? isPublicPost : !isPublicPost;
      });

  const hasAccessToContent = isAdmin || hasAdventures;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    
    setTimeout(() => {
      postsStartRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  if (isErrorPosts) {
    return (
      <div className="flex flex-1">
        <div className="flex flex-col flex-1 items-center gap-10 overflow-scroll py-10 px-5 md:px-8 lg:p-14 custom-scrollbar">
          <Suspense fallback={<div className="w-full max-w-7xl h-64 bg-dark-3 rounded-lg animate-pulse" />}>
            <div className="w-full max-w-7xl">
              <HeaderBanner type="home" identifier="main" height="lg" />
            </div>
          </Suspense>
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
        <Suspense fallback={<div className="w-full max-w-7xl h-64 bg-dark-3 rounded-lg animate-pulse" />}>
          <div className="w-full max-w-7xl">
            <HeaderBanner type="home" identifier="main" height="lg" />
          </div>
        </Suspense>

        <div className="home-posts">
          <div className="flex flex-col gap-4 w-full mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="h3-bold md:h2-bold text-left">
                Publicações Recentes
                {isSearching && (
                  <span className="text-sm text-light-4 ml-2">(buscando...)</span>
                )}
              </h2>
            </div>

            <div className="w-full max-w-md">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar posts por título, legenda ou tags..."
              />
            </div>
          </div>

          {/* Paginação superior */}
          {postsData && (postsData.totalPages > 1 || postsData.hasMore) && !isPostLoading && finalPosts.length > 0 && (
            <PaginationInfo
              currentPage={currentPage}
              totalPages={postsData.totalPages || 1}
              hasMore={postsData.hasMore}
              isLoading={isPostLoading}
              onPageChange={handlePageChange}
              onLoadMore={postsData.hasMore ? () => handlePageChange(currentPage + 1) : undefined}
              className="mb-8"
              compact={true}
            />
          )}

          {/* Marcador para scroll automático */}
          <div ref={postsStartRef} className="scroll-mt-4" />

          {isPostLoading || isLoadingAdventures ? (
            <div className="space-y-9">
              {Array.from({ length: currentPage === 1 ? 5 : 3 }).map((_, i) => (
                <PostCardSkeleton key={i} />
              ))}
            </div>
          ) : finalPosts.length === 0 ? (
            searchTerm ? (
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
            <>
              <ul className="flex flex-col flex-1 gap-9 w-full">
                {finalPosts.map((post) => (
                  <li key={post.$id}>
                    <LazyPostCard post={post} />
                  </li>
                ))}
              </ul>

              {/* Paginação inferior */}
              {postsData && (postsData.totalPages > 1 || postsData.hasMore) && (
                <PaginationInfo
                  currentPage={currentPage}
                  totalPages={postsData.totalPages || 1}
                  hasMore={postsData.hasMore}
                  isLoading={isPostLoading}
                  onPageChange={handlePageChange}
                  onLoadMore={postsData.hasMore ? () => handlePageChange(currentPage + 1) : undefined}
                />
              )}
            </>
          )}

          {(searchTerm || visibilityFilter !== 'all') && finalPosts.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-6 p-3 bg-dark-3 rounded-lg border border-dark-4">
              <p className="text-light-4 text-sm text-center">
                Exibindo {finalPosts.length} post{finalPosts.length !== 1 ? 's' : ''}
                {searchTerm && (
                  <span className="text-blue-400 font-medium ml-1">
                    para "{searchTerm}"
                  </span>
                )}
                {visibilityFilter !== 'all' && (
                  <span className={`font-medium ml-1 ${
                    visibilityFilter === 'public' ? 'text-blue-400' : 'text-orange-400'
                  }`}>
                    • {visibilityFilter === 'public' ? 'Públicos' : 'Restritos'}
                  </span>
                )}
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setVisibilityFilter('all');
                }}
                className="text-primary-500 hover:text-primary-400 text-sm underline ml-2"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
        
        <BackToTopButton postsCount={finalPosts.length} />
      </div>
    </div>
  );
};

export default Home;