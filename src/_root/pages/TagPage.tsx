import Loader, { ListLoader } from "@/components/shared/Loader";

import { Models } from "appwrite";
import PostCard from "@/components/shared/PostCard";
import { TagBanner } from "@/components/shared/HeaderBanner";
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

  if (isErrorPosts) {
    return (
      <div className="flex flex-1">
        <div className="home-container">
          <TagBanner tagName={tag || "Error"} />
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
      <div className="flex flex-col flex-1 items-center gap-10 overflow-scroll py-10 px-5 md:px-8 lg:p-14 custom-scrollbar">
        <div className="w-full max-w-6xl">
          <TagBanner
            tagName={capitalizeTag(tag)}
            postCount={posts?.documents.length || 0}
          />
        </div>

        <div className="home-posts">
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