import EmptyState, { LoadingState, NoAdventuresState, NoPostsState } from "@/components/shared/EmptyState";
import { useAdventureFiltering, usePostFiltering } from "@/hooks/useFiltering";

import { CompactAdventureSelect } from "@/components/shared/AdventureSelect";
import HeaderBanner from "@/components/shared/HeaderBanner";
import { Models } from "appwrite";
import PostCard from "@/components/shared/PostCard";
import UserCard from "@/components/shared/UserCard";
import { UserLoader } from "@/components/shared/Loader";
import { useGetRecentPosts } from "@/lib/react-query/posts";
import { useGetUsers } from "@/lib/react-query/user";
import { useState } from "react";

const Home = () => {
  const [selectedAdventure, setSelectedAdventure] = useState<string>("");

  // Sistema de filtragem por aventuras
  const {
    activeUserAdventures,
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
    data: creators,
    isLoading: isUserLoading,
    isError: isErrorCreators,
  } = useGetUsers(10);

  // Filtragem de posts
  const { filteredPosts } = usePostFiltering(allPosts?.documents || []);

  // Posts finais (considerando filtro por aventura específica)
  const finalPosts = selectedAdventure 
    ? filteredPosts.filter((post: Models.Document) => 
        post.adventures && post.adventures.includes(selectedAdventure)
      )
    : filteredPosts;

  // Encontrar aventura selecionada
  const selectedAdventureData = activeUserAdventures.find(
    adventure => adventure.$id === selectedAdventure
  );

  // Estados de erro
  if (isErrorPosts || isErrorCreators) {
    return (
      <div className="flex flex-1">
        <div className="flex flex-col flex-1 items-center gap-10 overflow-scroll py-10 px-5 md:px-8 lg:p-14 custom-scrollbar">
          <div className="w-full max-w-5xl">
            <HeaderBanner 
              title="Ops! Algo deu errado"
              subtitle="Não foi possível carregar o conteúdo"
              height="sm"
            />
          </div>
          <EmptyState 
            type="empty"
            title="Erro ao carregar conteúdo"
            description="Algo deu errado ao carregar os posts. Tente recarregar a página."
            onRetry={() => window.location.reload()}
          />
        </div>
        <div className="home-creators">
          {isErrorCreators ? (
            <p className="body-medium text-light-1">Erro ao carregar usuários</p>
          ) : (
            <>
              <h3 className="h3-bold text-light-1">Usuários Ativos</h3>
              {isUserLoading ? (
                <UserLoader count={4} />
              ) : (
                <ul className="grid 2xl:grid-cols-2 gap-6">
                  {creators?.documents.map((creator: Models.Document) => (
                    <li key={creator?.$id}>
                      <UserCard user={creator} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="flex flex-col flex-1 items-center gap-10 overflow-scroll py-10 px-5 md:px-8 lg:p-14 custom-scrollbar">
        <div className="w-full max-w-6xl">
          <HeaderBanner 
            title="Obziammos"
            subtitle="Aventuras épicas e momentos inesquecíveis"
            height="md"
          />
        </div>
        
        <div className="home-posts">
          {/* Header com filtro */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full mb-6">
            <h2 className="h3-bold md:h2-bold text-left">Publicações Recentes</h2>
            
            {/* Filtro por aventura - só mostra se há aventuras disponíveis */}
            {activeUserAdventures.length > 0 && (
              <CompactAdventureSelect
                adventures={activeUserAdventures}
                value={selectedAdventure}
                onChange={setSelectedAdventure}
                className="w-full sm:w-64"
              />
            )}
          </div>

          {/* Conteúdo principal */}
          {isPostLoading || isLoadingAdventures ? (
            <LoadingState text="Carregando posts..." />
          ) : !hasAdventures && !isAdmin ? (
            <NoAdventuresState />
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
            ) : (
              <NoPostsState hasAdventures={hasAdventures} />
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

          {/* Indicador de filtro ativo */}
          {selectedAdventure && finalPosts.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-6 p-3 bg-dark-3 rounded-lg border border-dark-4">
              <p className="text-light-4 text-sm">
                Exibindo posts de: 
                <span className="text-primary-500 font-medium ml-1">
                  {selectedAdventureData?.title}
                </span>
              </p>
              <button
                onClick={() => setSelectedAdventure("")}
                className="text-primary-500 hover:text-primary-400 text-sm underline ml-2"
              >
                Ver todos
              </button>
            </div>
          )}

          {/* Stats de filtragem para admins */}
          {isAdmin && allPosts?.documents && (
            <div className="mt-6 p-3 bg-dark-4/50 rounded-lg border border-dark-4">
              <p className="text-light-4 text-xs text-center">
                <span className="text-primary-500 font-medium">Admin:</span> 
                {" "}Exibindo {finalPosts.length} de {allPosts.documents.length} posts
                {filteredPosts.length !== allPosts.documents.length && (
                  <span className="text-light-3">
                    {" "}({allPosts.documents.length - filteredPosts.length} filtrados por aventuras)
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="home-creators">
        <h3 className="h3-bold text-light-1">Usuários Ativos</h3>
        {isUserLoading ? (
          <UserLoader count={4} />
        ) : (
          <ul className="grid 2xl:grid-cols-2 gap-6">
            {creators?.documents.map((creator: Models.Document) => (
              <li key={creator?.$id}>
                <UserCard user={creator} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Home;