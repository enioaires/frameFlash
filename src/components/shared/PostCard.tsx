import { Globe, Lock, Users } from "lucide-react";

import { Link } from "react-router-dom";
import { Models } from "appwrite";
import PostStats from "./PostStats";
import { timeAgo } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";

interface PostCardProps {
  post: Models.Document;
}

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useUserContext();

  if (!post.creator) return null;

  // Verificar se o post é público (sem aventuras)
  const isPublicPost = !post.adventures || post.adventures.length === 0;

  // Função para renderizar o conteúdo da legenda
  const renderCaptions = (captions: string[] | string) => {
    if (Array.isArray(captions)) {
      // Se for array (formato antigo), junta com <br>
      return captions.map((caption, index) => (
        <div 
          key={index} 
          dangerouslySetInnerHTML={{ __html: caption }}
          className="mb-2 last:mb-0"
        />
      ));
    } else if (typeof captions === 'string') {
      // Se for string (novo formato), renderiza o HTML
      return (
        <div 
          dangerouslySetInnerHTML={{ __html: captions }}
          className="rich-text-content"
        />
      );
    }
    return null;
  };

  // Função para obter informações de visibilidade
  const getVisibilityInfo = () => {
    if (isPublicPost) {
      return {
        icon: <Globe className="w-4 h-4 text-blue-400" />,
        text: "Post Público",
        description: "Visível para todos os usuários",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30",
        textColor: "text-blue-400"
      };
    }

    // Post com aventuras - verificar se há aventuras públicas
    const hasPublicAdventures = post.adventures?.some((adventure: any) => 
      adventure.isPublic === true
    );

    if (hasPublicAdventures) {
      return {
        icon: <Users className="w-4 h-4 text-green-400" />,
        text: "Post Semi-Público",
        description: `${post.adventures.length} aventura(s) • Algumas públicas`,
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/30",
        textColor: "text-green-400"
      };
    }

    return {
      icon: <Lock className="w-4 h-4 text-orange-400" />,
      text: "Post Privado",
      description: `${post.adventures.length} aventura(s) privada(s)`,
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
      textColor: "text-orange-400"
    };
  };

  const visibilityInfo = getVisibilityInfo();

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
        <Link
          to={`/update-post/${post.$id}`}
          className={`${user.id !== post.creator.$id && "hidden"}`}
        >
          <img
            src="/assets/icons/edit.svg"
            alt="edit-icon"
            className="w-5 h-5"
          />
        </Link>
      </div>

      {/* Indicador de Visibilidade */}
      <div className={`flex items-center gap-2 p-2 rounded-lg border mb-3 ${visibilityInfo.bgColor} ${visibilityInfo.borderColor}`}>
        {visibilityInfo.icon}
        <div className="flex-1">
          <span className={`text-sm font-medium ${visibilityInfo.textColor}`}>
            {visibilityInfo.text}
          </span>
          <p className="text-xs text-light-4 mt-0.5">
            {visibilityInfo.description}
          </p>
        </div>
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

      <div className="text-md py-5">
        <div className="flex flex-col gap-4">
          {renderCaptions(post.captions)}
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