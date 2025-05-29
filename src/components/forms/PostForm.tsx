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

import AdventureMultiSelect from "../shared/AdventureMultiSelect";
import { Button } from "../ui/button";
import FileUploader from "../shared/FileUploader";
import { Input } from "../ui/input";
import Loader from "../shared/Loader";
import { Models } from "appwrite";
import { MultiSelect } from "../shared/multi-select";
import { PostSchema } from "@/lib/validation";
import { RichTextEditor } from "../shared/rich-text-editor";
import { getAvailableTags } from "@/lib/tags";
import { isAdmin } from "@/lib/adventures";
import { useForm } from "react-hook-form";
import { useGetAdventuresForUser } from "@/lib/react-query/adventures";
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

  // BUSCAR AVENTURAS DISPONÍVEIS PARA O USUÁRIO
  const { data: userAdventures, isLoading: isLoadingAdventures } = useGetAdventuresForUser(
    user.id, 
    user.role
  );

  // Obtém as tags disponíveis dinamicamente
  const availableTags = getAvailableTags();

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
      adventures: post ? (post.adventures || []) : [], // MUDOU de location
      tags: post ? post.tags || [] : [],
    },
  });

  async function onSubmit(values: z.infer<typeof PostSchema>) {
    const allowedIds = [
      "2f9599f6-f734-4ba4-b351-90a5958a90cf",
      "9977be99-cc64-48df-bb5a-42daba635447",
      "09f99d93-9cdc-4dcd-b698-da1574506f6f",
      "b6b5df9c-9d09-4614-9920-684cc0effb7a"
    ];
    if (!allowedIds.includes(user.id)) {
      return toast({
        title: "Erro ao criar post",
        description: "Você não tem permissão para criar posts",
      });
    }

    // VALIDAR SE USUÁRIO PODE POSTAR NAS AVENTURAS SELECIONADAS
    if (!isAdmin(user)) {
      const userAdventureIds = userAdventures?.documents.map(a => a.$id) || [];
      const canPost = values.adventures.every(adventureId => 
        userAdventureIds.includes(adventureId)
      );
      
      if (!canPost) {
        return toast({
          title: "Erro de permissão",
          description: "Você só pode criar posts em aventuras onde participa",
        });
      }
    }

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

        {/* CAMPO AVENTURAS - SUBSTITUIU LOCATION */}
        <FormField
          control={form.control}
          name="adventures"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Aventuras</FormLabel>
              <FormControl>
                {isLoadingAdventures ? (
                  <div className="flex items-center justify-center h-12 bg-dark-4 rounded-md">
                    <Loader size="sm" />
                    <span className="ml-2 text-light-4 text-sm">Carregando aventuras...</span>
                  </div>
                ) : (
                  <AdventureMultiSelect
                    adventures={userAdventures?.documents || []}
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Selecione as aventuras para este post..."
                    error={form.formState.errors.adventures?.message}
                  />
                )}
              </FormControl>
              <FormMessage className="shad-form_message" />
              {!isAdmin(user) && (
                <p className="text-light-4 text-sm mt-1">
                  Você só pode postar em aventuras onde participa
                </p>
              )}
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
            disabled={isCreating || isUpdating || isLoadingAdventures}
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