import {
  useDeleteSavedPost,
  useGetCurrentUser,
  useLikePost,
  useSavePost,
} from "@/lib/react-query/posts";
import { useEffect, useState } from "react";

import CommentsModal from "./CommentsModal";
import CommentsSection from "./CommentsSection";
import { MessageCircle } from "lucide-react";
import { Models } from "appwrite";
import { checkIsLiked } from "@/lib/utils";
import { useGetCommentsCount } from "@/lib/react-query/comments";
import { useLocation } from "react-router-dom";

type PostStatsProps = {
  post: Models.Document;
  userId: string;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
  const location = useLocation();
  const likesList = post.likes.map((user: Models.Document) => user.$id);

  const [likes, setLikes] = useState<string[]>(likesList);
  const [isSaved, setIsSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  const { mutate: likePost } = useLikePost();
  const { mutate: savePost } = useSavePost();
  const { mutate: deleteSavePost } = useDeleteSavedPost();

  const { data: currentUser } = useGetCurrentUser();
  const { data: commentsCount } = useGetCommentsCount(post.$id);

  // Determinar se estamos na página de detalhes ou na home
  const isDetailPage = location.pathname.startsWith('/posts/');

  const savedPostRecord = currentUser?.save.find(
    (record: Models.Document) => record.post.$id === post.$id
  );

  useEffect(() => {
    setIsSaved(!!savedPostRecord);
  }, [currentUser]);

  const handleLikePost = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    e.stopPropagation();

    let likesArray = [...likes];

    if (likesArray.includes(userId)) {
      likesArray = likesArray.filter((Id) => Id !== userId);
    } else {
      likesArray.push(userId);
    }

    setLikes(likesArray);
    likePost({ postId: post.$id, likesArray });
  };

  const handleSavePost = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    e.stopPropagation();

    if (savedPostRecord) {
      setIsSaved(false);
      return deleteSavePost(savedPostRecord.$id);
    }

    savePost({ userId: userId, postId: post.$id });
    setIsSaved(true);
  };

  const handleCommentsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isDetailPage) {
      // Na página de detalhes, expandir/colapsar inline
      setShowComments(!showComments);
    } else {
      // Na home, abrir modal
      setShowCommentsModal(true);
    }
  };

  const containerStyles = location.pathname.startsWith("/profile")
    ? "w-full"
    : "";

  return (
    <>
      <div
        className={`flex justify-between items-center z-20 ${containerStyles}`}
      >
        <div className="flex gap-4 mr-5">
          {/* Likes */}
          <div className="flex gap-2">
            <img
              src={`${
                checkIsLiked(likes, userId)
                  ? "/assets/icons/liked.svg"
                  : "/assets/icons/like.svg"
              }`}
              alt="like"
              width={20}
              height={20}
              onClick={(e) => handleLikePost(e)}
              className="cursor-pointer"
            />
            <p className="small-medium lg:base-medium">{likes.length}</p>
          </div>

          {/* Comments */}
          <div className="flex gap-2">
            <button
              onClick={handleCommentsClick}
              className="flex items-center gap-1 hover:opacity-70 transition-opacity"
            >
              <MessageCircle className="w-5 h-5 text-light-3" />
              <p className="small-medium lg:base-medium text-light-3">
                {commentsCount || 0}
              </p>
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <img
            src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
            alt="save"
            width={20}
            height={20}
            className="cursor-pointer"
            onClick={(e) => handleSavePost(e)}
          />
        </div>
      </div>

      {/* Comments Section - apenas na página de detalhes */}
      {isDetailPage && (
        <div className="mt-4">
          <CommentsSection
            postId={post.$id}
            isExpanded={showComments}
            onToggle={() => setShowComments(!showComments)}
          />
        </div>
      )}

      {/* Comments Modal - apenas na home */}
      {showCommentsModal && (
        <CommentsModal
          post={post}
          isOpen={showCommentsModal}
          onClose={() => setShowCommentsModal(false)}
        />
      )}
    </>
  );
};

export default PostStats;