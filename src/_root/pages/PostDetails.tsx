import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useDeletePost,
  useGetPostById,
  useGetUserPosts,
} from "@/lib/react-query/posts";

import { Button } from "@/components/ui/button";
import CollapsibleCaption from "@/components/shared/CollapsibleCaption";
import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import PostStats from "@/components/shared/PostStats";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";

const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUserContext();

  const { data: post, isLoading } = useGetPostById(id);
  const { data: userPosts, isLoading: isUserPostLoading } = useGetUserPosts(
    post?.creator.$id
  );
  const { mutate: deletePost } = useDeletePost();

  const relatedPosts = userPosts?.documents.filter(
    (userPost) => userPost.$id !== id
  );

  const handleDeletePost = () => {
    if (!id) return;

    deletePost({ postId: id, imageId: post?.imageId });
    navigate(-1);
  };

  return (
    <div className="post_details-container">
      <div className="hidden md:flex max-w-5xl w-full">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="shad-button_ghost"
        >
          <img
            src={"/assets/icons/back.svg"}
            alt="back"
            width={24}
            height={24}
          />
          <p className="small-medium lg:base-medium">Voltar</p>
        </Button>
      </div>

      {isLoading || !post ? (
        <Loader />
      ) : (
        <div className="post_details-card">
          {/* IMAGEM - LADO ESQUERDO - FIXO */}
          <div className="xl:w-[48%] flex-shrink-0 xl:max-h-[80vh] xl:overflow-hidden">
            <img
              src={post?.imageUrl}
              alt="post image"
              className="w-full h-auto xl:h-full rounded-t-[30px] xl:rounded-l-[24px] xl:rounded-tr-none object-cover p-5 bg-dark-1"
            />
          </div>

          {/* CONTEÚDO - LADO DIREITO - EXPANSÍVEL COM SCROLL */}
          <div className="flex flex-col flex-1 xl:max-h-[80vh]">
            {/* Header fixo */}
            <div className="bg-dark-2 p-8 pb-4 rounded-t-[30px] xl:rounded-tl-none border-b border-dark-4 flex-shrink-0">
              <div className="flex-between w-full mb-4">
                <Link
                  to={`/profile/${post?.creator.$id}`}
                  className="flex items-center gap-3"
                >
                  <img
                    src={
                      post?.creator.imageUrl ||
                      "/assets/icons/profile-placeholder.svg"
                    }
                    alt="creator"
                    className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
                  />
                  <div className="flex gap-1 flex-col">
                    <p className="base-medium lg:body-bold text-light-1">
                      {post?.creator.name}
                    </p>
                    <div className="flex-center gap-2 text-light-3">
                      <p className="subtle-semibold lg:small-regular ">
                        {multiFormatDateString(post?.$createdAt)}
                      </p>
                      •
                      <p className="subtle-semibold lg:small-regular">
                        {post?.location}
                      </p>
                    </div>
                  </div>
                </Link>

                <div className="flex-center gap-4">
                  <Link
                    to={`/update-post/${post?.$id}`}
                    className={`${user.id !== post?.creator.$id && "hidden"}`}
                  >
                    <img
                      src={"/assets/icons/edit.svg"}
                      alt="edit"
                      width={24}
                      height={24}
                    />
                  </Link>

                  <Button
                    onClick={handleDeletePost}
                    variant="ghost"
                    className={`post_details-delete_btn ${user.id === post?.creator.$id ? "" : "hidden"}`}
                  >
                    <img
                      src={"/assets/icons/delete.svg"}
                      alt="delete"
                      width={24}
                      height={24}
                    />
                  </Button>
                </div>
              </div>

              {/* TÍTULO */}
              <p className="font-semibold text-2xl text-center">{post?.title}</p>
            </div>

            {/* Conteúdo scrollável */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-dark-2">
              <div className="p-8 pt-4 space-y-6">
                {/* LEGENDA E TAGS */}
                <div className="flex flex-col w-full small-medium lg:base-regular">
                  <div className="flex flex-col gap-4">
                    <CollapsibleCaption 
                      captions={post.captions}
                      maxLines={8}
                      className="small-medium lg:base-regular"
                    />
                  </div>
                  <ul className="flex gap-1 mt-4 flex-wrap">
                    {post?.tags.map((tag: string, index: string) => (
                      <li
                        key={`${tag}${index}`}
                        className="text-light-3 small-regular"
                      >
                        #{tag}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* POST STATS E COMENTÁRIOS */}
                <div className="w-full">
                  <PostStats post={post} userId={user.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl">
        <hr className="border w-full border-dark-4/80" />

        <h3 className="body-bold md:h3-bold w-full my-10">
          Posts Relacionados
        </h3>
        {isUserPostLoading || !relatedPosts ? (
          <Loader />
        ) : (
          <GridPostList posts={relatedPosts} />
        )}
      </div>
    </div>
  );
};

export default PostDetails;