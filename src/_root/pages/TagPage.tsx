import EmptyState, { LoadingState, NoAdventuresState } from "@/components/shared/EmptyState";
import { useAdventureFiltering, usePostFiltering } from "@/hooks/useFiltering";

import BackToTopButton from "@/components/shared/BackToTopButton";
import { CompactAdventureSelect } from "@/components/shared/AdventureSelect";
import HeaderBanner from "@/components/shared/HeaderBanner";
import { Models } from "appwrite";
import PostCard from "@/components/shared/PostCard";
import SearchInput from "@/components/shared/SearchInput";
import { allMenuCategories } from "@/contants";
import { useGetPostsByTag } from "@/lib/react-query/posts";
import { useParams } from "react-router-dom";
import { useState } from "react";

const TagPage = () => {
  const { tag } = useParams<{ tag: string }>();
  const [selectedAdventure, setSelectedAdventure] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

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

  // Posts finais (considerando filtro por aventura específica)
  const finalPosts = selectedAdventure
    ? searchFilteredPosts.filter((post: Models.Document) =>
        post.adventures && post.adventures.includes(selectedAdventure)
      )
    : searchFilteredPosts;

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
          <HeaderBanner
            type="tag"
            identifier={tag || ""}
            height="lg"
          />
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
          <HeaderBanner
            type="tag"
            identifier={tag}
            height="lg"
          />
        </div>

        <div className="home-posts">
          {/* Header com filtro */}
          <div className="flex flex-col gap-4 w-full mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="h3-bold md:h2-bold text-left">
                  Posts com a tag "{capitalizeTag(tag)}"
                </h2>
                {(selectedAdventure && selectedAdventureData) || searchTerm ? (
                  <p className="text-light-4 text-sm mt-1">
                    {searchTerm && (
                      <>Busca: <span className="text-blue-400">"{searchTerm}"</span></>
                    )}
                    {searchTerm && selectedAdventure && " • "}
                    {selectedAdventure && selectedAdventureData && (
                      <>Aventura: <span className="text-primary-500">{selectedAdventureData.title}</span></>
                    )}
                  </p>
                ) : null}
              </div>

              {/* Filtro por aventura */}
              {activeUserAdventures.length > 0 && (
                <CompactAdventureSelect
                  adventures={activeUserAdventures}
                  value={selectedAdventure}
                  onChange={setSelectedAdventure}
                  className="w-full sm:w-64"
                />
              )}
            </div>

            {/* Input de Busca */}
            <div className="w-full max-w-md">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder={`Buscar posts em "${capitalizeTag(tag)}"...`}
              />
            </div>
          </div>

          {/* Conteúdo principal */}
          {isPostLoading || isLoadingAdventures ? (
            <LoadingState text={`Buscando posts com a tag "${tag}"...`} />
          ) : !hasAdventures && !isAdmin ? (
            <NoAdventuresState />
          ) : finalPosts.length === 0 ? (
            searchTerm ? (
              <EmptyState
                type="no_results"
                title="Nenhum post encontrado"
                description={`Sua busca por "${searchTerm}" na tag "${capitalizeTag(tag)}" não retornou resultados.`}
              >
                <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-primary-500 hover:text-primary-400 transition-colors underline"
                  >
                    Limpar busca
                  </button>
                  {selectedAdventure && (
                    <>
                      <span className="text-light-4">ou</span>
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedAdventure("");
                        }}
                        className="text-primary-500 hover:text-primary-400 transition-colors underline"
                      >
                        Ver todos os posts da tag
                      </button>
                    </>
                  )}
                </div>
              </EmptyState>
            ) : selectedAdventure ? (
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
                icon={typeof allMenuCategories.find(category =>
                  category.route === `/tag/${tag}`
                )?.icon === 'string' ? allMenuCategories.find(category =>
                  category.route === `/tag/${tag}`
                )?.icon as string || "🏷️" : "🏷️"}
                title={`Nenhum post com a tag "${capitalizeTag(tag)}"`}
                description="Ainda não há posts com essa tag. Que tal criar o primeiro?"
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
                {searchTerm && (
                  <span className="text-blue-400 font-medium ml-1">
                    para "{searchTerm}"
                  </span>
                )}
                {selectedAdventure && (
                  <span className="text-primary-500 font-medium ml-1">
                    {searchTerm ? " em" : " na"} "{selectedAdventureData?.title}"
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Clear filters */}
          {(selectedAdventure || searchTerm) && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setSelectedAdventure("");
                  setSearchTerm("");
                }}
                className="text-primary-500 hover:text-primary-400 text-sm transition-colors"
              >
                ← Voltar para todos os posts com "{capitalizeTag(tag)}"
              </button>
            </div>
          )}
          <BackToTopButton postsCount={finalPosts.length} />
        </div>
      </div>
    </div>
  );
};

export default TagPage;