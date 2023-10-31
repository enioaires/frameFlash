import Loader from "@/components/shared/Loader";
import PostCard from "@/components/shared/PostCard";
import { useGetRecentPosts } from "@/lib/react-query/queries";
import { Models } from "appwrite";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { data: posts, isPending } = useGetRecentPosts();
  const navigate = useNavigate();

  return (
    <div className="flex flex-1">
      <div className="home-container">
        <div className="home-posts">
          <div className="flex items-center justify-between w-full">
            <h2 className="h3-bold md:h2-bold text-left w-full">Feed</h2>
            <img
              src="/assets/icons/gallery-add.svg"
              alt="Criar post"
              className="px-7 cursor-pointer"
              onClick={() => navigate("/create-post")}
            />
          </div>
          {isPending && !posts ? (
            <Loader />
          ) : (
            <ul className="flex flex-col flex-1 gap-9 w-full">
              {posts?.documents.map((post: Models.Document) => (
                <PostCard key={post.caption} post={post} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
