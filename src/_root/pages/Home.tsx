import Loader, { ListLoader, UserLoader } from "@/components/shared/Loader";

import HeaderBanner from "@/components/shared/HeaderBanner";
import { Models } from "appwrite";
import PostCard from "@/components/shared/PostCard";
import UserCard from "@/components/shared/UserCard";
import { useGetRecentPosts } from "@/lib/react-query/posts";
import { useGetUsers } from "@/lib/react-query/user";

const Home = () => {
  const {
    data: posts,
    isLoading: isPostLoading,
    isError: isErrorPosts,
  } = useGetRecentPosts();
  const {
    data: creators,
    isLoading: isUserLoading,
    isError: isErrorCreators,
  } = useGetUsers(10);

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
          <div className="flex-center flex-col gap-4">
            <p className="body-medium text-light-1">Algo deu errado ao carregar os posts</p>
            <Loader text="Tentando reconectar..." />
          </div>
        </div>
        <div className="home-creators">
          <p className="body-medium text-light-1">Erro ao carregar usuários</p>
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
          <h2 className="h3-bold md:h2-bold text-left w-full">Publicações Recentes</h2>
          {isPostLoading ? (
            <ListLoader count={3} />
          ) : posts?.documents.length === 0 ? (
            <div className="flex-center flex-col gap-4 py-10">
              <p className="text-light-4">Nenhuma publicação encontrada</p>
              <Loader variant="dots" text="Carregando conteúdo..." />
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