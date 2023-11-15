import PostForm from "@/components/forms/PostForm";
import Loader from "@/components/shared/Loader";
import { useGetpostById } from "@/lib/react-query/queries";
import { useParams } from "react-router-dom";

const EditPost = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isPending } = useGetpostById(id || "");

  if (isPending)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="max-w-5xl flex-start gap-3 justify-start w-full">
          <img
            src="/assets/icons/add-post.svg"
            alt="add-post"
            width={36}
            height={36}
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Editar Post</h2>
        </div>
        <PostForm action="update" post={data} />
      </div>
    </div>
  );
};

export default EditPost;
