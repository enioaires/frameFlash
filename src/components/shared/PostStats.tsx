import { useDeleteSavedPost, useLikePost } from "@/lib/react-query/queries";
import { checkIsLiked } from "@/lib/utils";
import { Models } from "appwrite";
import { FC, useState } from "react";

type Props = {
  post?: Models.Document;
  userId: string;
};

const PostStats: FC<Props> = ({ post, userId }) => {
  const likesList = post?.likes.map((user: Models.Document) => user.$id);

  const [likes, setLikes] = useState<string[]>(likesList);

  const { mutate: likePost } = useLikePost();
  useDeleteSavedPost();

  const handleLikePost = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    e.stopPropagation();

    let newLikes = [...likes];

    const hasLiked = newLikes.includes(userId);

    if (hasLiked) {
      newLikes = newLikes.filter((id) => id !== userId);
    } else {
      newLikes.push(userId);
    }

    setLikes(newLikes);
    likePost({ postId: post?.$id || "", likesArray: newLikes });
  };

  return (
    <div className="flex justify-between items-center z-20 px-2">
      <div className="flex gap-2 mr-5">
        <img
          src={
            checkIsLiked(likes, userId)
              ? "/assets/icons/liked.svg"
              : "/assets/icons/like.svg"
          }
          alt="like"
          width={20}
          height={20}
          onClick={handleLikePost}
          className="cursor-pointer"
        />
        <p className="small-medium lg:base-medium">{likes.length}</p>
      </div>
    </div>
  );
};
export default PostStats;
