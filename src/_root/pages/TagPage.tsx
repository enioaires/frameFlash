import EmptyState, { LoadingState, NoAdventuresState } from "@/components/shared/EmptyState";
import { useAdventureFiltering, usePostFiltering } from "@/hooks/useFiltering";

import { CompactAdventureSelect } from "@/components/shared/AdventureSelect";
import { Models } from "appwrite";
import PostCard from "@/components/shared/PostCard";
import { TagBanner } from "@/components/shared/HeaderBanner";
import { useGetPostsByTag } from "@/lib/react-query/posts";
import { useParams } from "react-router-dom";
import { useState } from "react";

const TagPage = () => {
  const { tag } = useParams<{ tag: string }>();
  const [selectedAdventure, setSelectedAdventure] = useState<string>("");

  // Sistema de filtragem por aventuras
  const {
    activeUserAdventures,
    hasAdventures,
    isAdmin,
    isLoading: isLoadingAdventures
  } = useAdventureFiltering();

  // Posts da tag
  const {
    data: allTagPosts,
    isLoading: isPostLoading,
    isError: isErrorPosts,
  } = useGetPostsByTag(tag || "");
  // Filtrar posts baseado nas aventuras do usuário
  const { filteredPosts } = usePostFiltering(allTagPosts?.documents || []);

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

  // Função para capitalizar a primeira letra
  const capitalizeTag = (tagName: string) => {
    return tagName.charAt(0).toUpperCase() + tagName.slice(1).toLowerCase();
  };

  // Estados de erro
  if (isErrorPosts) {
    return (
      <div className="flex flex-1">
        <div className="home-container">
          <TagBanner tagName={tag || "Error"} />
          <EmptyState 
            type="empty"
            title="Erro ao carregar posts"
            description="Algo deu errado ao carregar os posts desta tag."
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="flex flex-1">
        <div className="home-container">
          <EmptyState 
            type="empty"
            title="Tag não especificada"
            description="Nenhuma tag foi especificada para busca."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="flex flex-col flex-1 items-center gap-10 overflow-scroll py-10 px-5 md:px-8 lg:p-14 custom-scrollbar">
        <div className="w-full max-w-6xl">
          <TagBanner
            tagName={capitalizeTag(tag)}
            postCount={finalPosts.length}
          />
        </div>

        <div className="home-posts">
          {/* Header com filtro */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full mb-6">
            <div>
              <h2 className="h3-bold md:h2-bold text-left">
                Posts com a tag "{capitalizeTag(tag)}"
              </h2>
              {selectedAdventure && selectedAdventureData && (
                <p className="text-light-4 text-sm mt-1">
                  Filtrados por aventura: <span className="text-primary-500">{selectedAdventureData.title}</span>
                </p>
              )}
            </div>
            
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
            <LoadingState text={`Buscando posts com a tag "${tag}"...`} />
          ) : !hasAdventures && !isAdmin ? (
            <NoAdventuresState />
          ) : finalPosts.length === 0 ? (
            selectedAdventure ? (
              <EmptyState
                type="no_results"
                title={`Nenhum post encontrado`}
                description={`Não há posts com a tag "${capitalizeTag(tag)}" na aventura "${selectedAdventureData?.title}".`}
              >
                <button
                  onClick={() => setSelectedAdventure("")}
                  className="text-primary-500 hover:text-primary-400 transition-colors underline"
                >
                  Ver posts de todas as aventuras
                </button>
              </EmptyState>
            ) : allTagPosts?.documents.length === 0 ? (
              <EmptyState
                type="no_results"
                title={`Nenhum post com a tag "${capitalizeTag(tag)}"`}
                description="Não encontramos nenhum post com esta tag ainda."
                icon="🏷️"
              />
            ) : (
              <EmptyState
                type="no_results"
                title="Nenhum post visível"
                description={`Há posts com a tag "${capitalizeTag(tag)}", mas você não tem acesso a eles. Entre em contato com um mestre para ser adicionado às aventuras relevantes.`}
                showContactInfo
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

          {/* Indicador de resultados */}
          {finalPosts.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-6 p-3 bg-dark-3 rounded-lg border border-dark-4">
              <p className="text-light-4 text-sm text-center">
                {finalPosts.length} post{finalPosts.length !== 1 ? 's' : ''} encontrado{finalPosts.length !== 1 ? 's' : ''}
                {selectedAdventure && ` nesta aventura`}
                {allTagPosts?.documents && selectedAdventure && 
                 filteredPosts.length !== finalPosts.length && (
                  <span className="text-light-3 ml-1">
                    (de {filteredPosts.length} visíveis)
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Stats detalhadas para admins */}
          {isAdmin && allTagPosts?.documents && finalPosts.length > 0 && (
            <div className="mt-2 p-3 bg-dark-4/50 rounded-lg border border-dark-4">
              <div className="text-light-4 text-xs text-center space-y-1">
                <p>
                  <span className="text-primary-500 font-medium">Admin:</span>
                  {" "}Total com tag "{tag}": {allTagPosts.documents.length}
                </p>
                <p>
                  Visíveis para usuários: {filteredPosts.length} | 
                  Nesta aventura: {finalPosts.length}
                </p>
              </div>
            </div>
          )}

          {/* Clear filters */}
          {selectedAdventure && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setSelectedAdventure("")}
                className="text-primary-500 hover:text-primary-400 text-sm transition-colors"
              >
                ← Voltar para todos os posts com "{capitalizeTag(tag)}"
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TagPage;