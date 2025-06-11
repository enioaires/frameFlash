// Em src/components/shared/PostCard.tsx

import AudioPlayer from "./AudioPlayer"; // ADICIONAR ESTE IMPORT
import CollapsibleCaption from "./CollapsibleCaption";
import { Link } from "react-router-dom";
import { Models } from "appwrite";
import PostStats from "./PostStats";
import { isAdmin } from "@/lib/adventures";
import { timeAgo } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";

interface PostCardProps {
  post: Models.Document;
}

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useUserContext();
  const userIsAdmin = isAdmin(user);

  if (!post.creator) return null;

  const canEdit = user.id === post.creator.$id || userIsAdmin;

  return (
    <div className="post-card">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.creator.$id}`}>
            <img
              src={
                post?.creator?.imageUrl ||
                "/assets/icons/profile-placeholder.svg"
              }
              alt="profile-picture"
              className="rounded-full w-12 h-12"
            />
          </Link>

          <div className="flex flex-col">
            <p className="base-medium lg:body-bold text-light-1">
              {post.creator.name}
            </p>
            <div className="flex-center gap-2 text-light-3">
              <p className="subtle-semibold lg:small-regular">
                {timeAgo(post.$createdAt)}
              </p>
            </div>
          </div>
        </div>
        
        {canEdit && (
          <Link to={`/update-post/${post.$id}`}>
            <img
              src="/assets/icons/edit.svg"
              alt="edit-icon"
              className="w-5 h-5"
            />
          </Link>
        )}
      </div>

      <Link to={`/posts/${post.$id}`}>
        <div className="font-semibold text-2xl text-center py-5">
          <p>{post.title}</p>
        </div>

        <img
          src={post.imageUrl || "assets/icons/profile-placeholder.svg"}
          alt="post-image"
          className="post-card_img"
        />
      </Link>

      {/* Player de áudio - posicionado abaixo da imagem */}
      {post.audioUrl && (
        <div className="mt-4">
          <AudioPlayer 
            audioUrl={post.audioUrl} 
            title={post.title}
          />
        </div>
      )}

      <div className="text-md py-5">
        <div className="flex flex-col gap-4">
          <CollapsibleCaption 
            captions={post.captions}
            maxLines={12}
          />
        </div>
        <ul className="flex gap-1 mt-2">
          {post.tags.map((tag: string) => (
            <li key={tag} className="text-light-3">
              #{tag}
            </li>
          ))}
        </ul>
      </div>

      <PostStats post={post} userId={user.id} />
    </div>
  );
};

export default PostCard;