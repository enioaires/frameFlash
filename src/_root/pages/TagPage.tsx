import Loader, { ListLoader } from "@/components/shared/Loader";

import { Models } from "appwrite";
import PostCard from "@/components/shared/PostCard";
import { useGetPostsByTag } from "@/lib/react-query/posts";
import { useParams } from "react-router-dom";

const TagPage = () => {
  const { tag } = useParams<{ tag: string }>();

  const {
    data: posts,
    isLoading: isPostLoading,
    isError: isErrorPosts,
  } = useGetPostsByTag(tag || "");

  // Função para capitalizar a primeira letra
  const capitalizeTag = (tagName: string) => {
    return tagName.charAt(0).toUpperCase() + tagName.slice(1).toLowerCase();
  };

  // Mapear tags para títulos mais amigáveis
  const getTagTitle = (tagName: string) => {
    const tag = tagName.toLowerCase();
    // Handle plural forms
    const singularTag = tag.endsWith('s') ? tag.slice(0, -1) : tag;

    const tagMap: { [key: string]: string } = {
      'item': 'Items',
      'lore': 'Lore',
    };

    return tagMap[singularTag] || `Posts sobre ${capitalizeTag(tagName)}`;
  };

  if (isErrorPosts) {
    return (
      <div className="flex flex-1">
        <div className="home-container">
          <div className="flex-center flex-col gap-4">
            <p className="body-medium text-light-1">Erro ao carregar posts</p>
            <Loader text="Tentando reconectar..." />
          </div>
        </div>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="flex flex-1">
        <div className="home-container">
          <div className="flex-center flex-col gap-4">
            <p className="body-medium text-light-1">Tag não especificada</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="home-container">
        <div className="home-posts">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-primary-500 rounded-full"></div>
            <h2 className="h3-bold md:h2-bold text-left w-full">
              {getTagTitle(tag)}
            </h2>
          </div>

          {isPostLoading ? (
            <ListLoader count={4} />
          ) : posts?.documents.length === 0 ? (
            <div className="flex-center flex-col gap-4 py-10">
              <p className="text-light-4">
                Nenhum post encontrado para "{capitalizeTag(tag)}"
              </p>
              <Loader variant="dots" text={`Procurando posts sobre ${tag.toLowerCase()}...`} />
            </div>
          ) : (
            <ul className="flex flex-col flex-1 gap-9 w-full">
              {posts?.documents.map((post: Models.Document) => (
                <li key={post.$id} className="flex justify-center w-full">
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default TagPage;