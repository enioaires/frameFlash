import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useDeletePost,
  useGetPostById,
  useGetUserPosts,
} from "@/lib/react-query/posts";

import { Button } from "@/components/ui/button";
import CollapsibleCaption from "@/components/shared/CollapsibleCaption";
import GridPostList from "@/components/shared/GridPostList";
import HeaderBanner from "@/components/shared/HeaderBanner";
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
    <div className="min-h-screen flex flex-col">
      {/* Container principal com scroll natural */}
      <div className="flex flex-col flex-1 gap-6 md:gap-10 py-6 md:py-10 px-4 md:px-8 lg:px-14 items-center">
        
        {/* Header Banner */}
        <div className="w-full max-w-[1400px]">
          <HeaderBanner
            type="home"
            identifier="main"
            height="md"
          />
        </div>

        {/* Botão Voltar */}
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
          <>
            {/* Layout Mobile vs Desktop */}
            <div className="w-full max-w-[1400px]">
              
              {/* MOBILE LAYOUT */}
              <div className="xl:hidden bg-dark-2 rounded-[30px] border border-dark-4 overflow-hidden">
                {/* Imagem Mobile */}
                <div className="w-full">
                  <img
                    src={post?.imageUrl}
                    alt="post image"
                    className="w-full h-auto object-cover rounded-t-[30px] max-h-[50vh]"
                  />
                </div>

                {/* Conteúdo Mobile */}
                <div className="p-4 space-y-4">
                  {/* Header */}
                  <div className="flex-between w-full">
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
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex gap-1 flex-col">
                        <p className="base-medium text-light-1">
                          {post?.creator.name}
                        </p>
                        <div className="flex-center gap-2 text-light-3">
                          <p className="subtle-semibold">
                            {multiFormatDateString(post?.$createdAt)}
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
                          width={20}
                          height={20}
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
                          width={20}
                          height={20}
                        />
                      </Button>
                    </div>
                  </div>

                  {/* Título */}
                  <h1 className="font-semibold text-xl text-center">{post?.title}</h1>
                  
                  <hr className="border border-dark-4/80" />

                  {/* Legenda e Tags */}
                  <div className="space-y-4">
                    <CollapsibleCaption 
                      captions={post.captions}
                      maxLines={6}
                      className="text-sm"
                    />
                    
                    <ul className="flex gap-1 flex-wrap">
                      {post?.tags.map((tag: string, index: string) => (
                        <li
                          key={`${tag}${index}`}
                          className="text-light-3 text-sm"
                        >
                          #{tag}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Stats e Comentários */}
                  <PostStats post={post} userId={user.id} />
                </div>
              </div>

              {/* DESKTOP LAYOUT */}
              <div className="hidden xl:flex bg-dark-2 rounded-[30px] border border-dark-4 overflow-hidden min-h-[700px] max-h-[90vh]">
                {/* Imagem Desktop */}
                <div className="w-[55%] flex-shrink-0 max-h-[85vh] overflow-hidden">
                  <img
                    src={post?.imageUrl}
                    alt="post image"
                    className="w-full h-full object-cover rounded-l-[24px] p-5 bg-dark-1"
                  />
                </div>

                {/* Conteúdo Desktop */}
                <div className="flex flex-col flex-1 max-h-[85vh]">
                  {/* Header fixo */}
                  <div className="bg-dark-2 p-8 pb-4 border-b border-dark-4 flex-shrink-0">
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
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex gap-1 flex-col">
                          <p className="body-bold text-light-1">
                            {post?.creator.name}
                          </p>
                          <div className="flex-center gap-2 text-light-3">
                            <p className="small-regular">
                              {multiFormatDateString(post?.$createdAt)}
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

                    <h1 className="font-semibold text-2xl text-center">{post?.title}</h1>
                  </div>

                  {/* Conteúdo scrollável Desktop */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar bg-dark-2">
                    <div className="p-8 pt-4 space-y-6">
                      <div className="space-y-4">
                        <CollapsibleCaption 
                          captions={post.captions}
                          maxLines={8}
                          className="base-regular"
                        />
                        
                        <ul className="flex gap-1 flex-wrap">
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

                      <PostStats post={post} userId={user.id} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Posts Relacionados */}
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
    </div>
  );
};

export default PostDetails;