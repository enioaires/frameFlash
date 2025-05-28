/* eslint-disable @typescript-eslint/ban-ts-comment */

import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useCreatePost, useUpdatePost } from "@/lib/react-query/posts";

import { Button } from "../ui/button";
import FileUploader from "../shared/FileUploader";
import { Input } from "../ui/input";
import Loader from "../shared/Loader";
import { Models } from "appwrite";
import {MultiSelect} from "../shared/multi-select";
import { PostSchema } from "@/lib/validation";
import {RichTextEditor} from "../shared/rich-text-editor";
import { getAvailableTags } from "@/lib/tags";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useToast } from "../ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";

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

  // Obtém as tags disponíveis dinamicamente
  const availableTags = getAvailableTags();

  // Função auxiliar para converter HTML para texto simples (fallback)
  const htmlToText = (html: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  // Função para preparar as legendas para salvamento
  const prepareCaptions = (htmlContent: string): string[] => {
    if (!htmlContent || htmlContent.trim() === '') return [''];
    
    // Retorna como array com um elemento (formato esperado pelo banco)
    return [htmlContent];
  };

  const form = useForm<z.infer<typeof PostSchema>>({
    resolver: zodResolver(PostSchema),
    defaultValues: {
      title: post ? post.title : "",
      captions: post ? (Array.isArray(post.captions) ? post.captions.join('<br>') : post.captions || "") : "",
      file: [],
      location: post ? post.location : "",
      tags: post ? post.tags || [] : [],
    },
  });

  async function onSubmit(values: z.infer<typeof PostSchema>) {
    // console.log(values);
    // if (user.id !== "2da230a7-ef4d-463c-bd6e-fa024def9e14") {
    //   return toast({
    //     title: "Erro ao criar post",
    //     description: "Você não tem permissão para criar posts",
    //   });
    // }

    // Prepara as legendas para salvamento
    const processedCaptions = prepareCaptions(values.captions);

    if (post && action === "update") {
      const updatedPost = await updatePost({
        ...values,
        captions: prepareCaptions(values.captions),
        postId: post.$id,
        imageId: post.imageId,
        imageUrl: post.imageUrl,
        // Converte o array de tags para string separada por vírgula
        tags: values.tags.join(","),
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
      captions: prepareCaptions(values.captions),
      userId: user.id,
      // Converte o array de tags para string separada por vírgula
      tags: values.tags.join(","),
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

        <FormField
          control={form.control}
          name="captions"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Legenda</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Digite sua legenda aqui... Use as ferramentas de formatação acima."
                  className="w-full"
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

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
              <FormLabel className="shad-form_label">Aventura</FormLabel>
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
              <FormLabel className="shad-form_label">Selecionar Tags</FormLabel>
              <FormControl>
                <MultiSelect
                  options={availableTags}
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Selecione as tags para o post..."
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