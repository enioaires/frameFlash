/* eslint-disable @typescript-eslint/ban-ts-comment */
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "../ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import FileUploader from "../shared/FileUploader";
import { Input } from "../ui/input";
import { PostSchema } from "@/lib/validation";
import { Models } from "appwrite";
import { useUserContext } from "@/context/AuthContext";
import { useToast } from "../ui/use-toast";
import { useNavigate } from "react-router-dom";
import Loader from "../shared/Loader";
import { PlusSquare } from "lucide-react";
import { useCreatePost, useUpdatePost } from "@/lib/react-query/posts";

interface PostFormProps {
  post?: Models.Document;
  action: "create" | "update";
}

const PostForm = ({ post, action }: PostFormProps) => {
  const { mutateAsync: createPost, isPending: isCreating } = useCreatePost();

  const { mutateAsync: updatePost, isPending: isUpdating } = useUpdatePost();

  const { user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof PostSchema>>({
    resolver: zodResolver(PostSchema),
    defaultValues: {
      title: post ? post.title : "",
      captions: post ? post.captions : [""],
      file: [],
      location: post ? post.location : "",
      tags: post ? post.tags.join(",") : "",
    },
  });
  const { fields, append } = useFieldArray({
    control: form.control,
    //@ts-ignore
    name: "captions",
  });

  const onAddCaptionClick = () => {
    append({ text: "" });
  };

  async function onSubmit(values: z.infer<typeof PostSchema>) {
    console.log(values);
    if (user.id !== "2da230a7-ef4d-463c-bd6e-fa024def9e14") {
      return toast({
        title: "Erro ao criar post",
        description: "Você não tem permissão para criar posts",
      });
    }

    if (post && action === "update") {
      const updatedPost = await updatePost({
        ...values,
        postId: post.$id,
        imageId: post.imageId,
        imageUrl: post.imageUrl,
      });

      if (!updatedPost)
        return toast({
          title: "Erro ao atualizar post",
          description: "Tente novamente mais tarde",
        });

      return navigate(`/posts/${post.$id}`);
    }

    const newPost = await createPost({
      ...values,
      userId: user.id,
    });

    if (!newPost)
      return toast({
        title: "Erro ao criar post",
        description: "Tente novamente mais tarde",
      });

    navigate("/");
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-9 w-full max-w-5xl"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Titulo</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        {fields.map((field, index) => (
          <FormField
            key={field.id}
            control={form.control}
            name={`captions.${index}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">
                  Legenda {index + 1}
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="shad-textarea custom-scrollbar"
                    {...field}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage className="shad-form_message" />
              </FormItem>
            )}
          />
        ))}
        <div className="flex justify-end w-full items-center gap-2">
          <p>Adicionar Legenda</p>
          <PlusSquare className="cursor-pointer" onClick={onAddCaptionClick} />
        </div>
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Fotos</FormLabel>
              <FormControl>
                <FileUploader
                  fieldChange={field.onChange}
                  mediaUrl={post?.imageUrl}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Localização</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">
                Add Tags (separados por vírgula " , ")
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="shad-input"
                  placeholder="Arte, Educação, Aprendizado, ..."
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <div className="flex gap-4 items-center justify-end">
          <Button
            type="button"
            className="shad-button_dark_4"
            onClick={() => navigate("/")}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? (
              <div className="flex-center">
                <Loader />
              </div>
            ) : (
              <>{action === "create" ? "Enviar" : "Atualizar"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;
