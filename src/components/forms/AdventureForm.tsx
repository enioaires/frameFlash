import * as z from 'zod';

import { AdventureSchema, UpdateAdventureSchema } from '@/lib/validation';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCreateAdventure, useUpdateAdventure } from '@/lib/react-query/adventures';

import { Button } from '@/components/ui/button';
import FileUploader from '@/components/shared/FileUploader';
import { Input } from '@/components/ui/input';
import Loader from '@/components/shared/Loader';
import { Models } from 'appwrite';
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useUserContext } from '@/context/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';

interface AdventureFormProps {
  adventure?: Models.Document;
  action: 'create' | 'update';
}

const AdventureForm: React.FC<AdventureFormProps> = ({ adventure, action }) => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { mutateAsync: createAdventure, isPending: isCreating } = useCreateAdventure();
  const { mutateAsync: updateAdventure, isPending: isUpdating } = useUpdateAdventure();

  const isLoading = isCreating || isUpdating;

  const form = useForm<z.infer<typeof AdventureSchema>>({
    resolver: zodResolver(action === 'create' ? AdventureSchema : UpdateAdventureSchema),
    defaultValues: {
      title: adventure?.title || '',
      description: adventure?.description || '',
      file: [],
      status: adventure?.status || 'active',
      isPublic: adventure?.isPublic || false,
    },
  });

  const onSubmit = async (values: z.infer<typeof AdventureSchema>) => {
    try {
      if (action === 'update' && adventure) {
        const updatedAdventure = await updateAdventure({
          adventureId: adventure.$id,
          title: values.title,
          description: values.description,
          file: values.file,
          status: values.status,
          isPublic: values.isPublic,
          imageId: adventure.imageId,
          imageUrl: adventure.imageUrl,
        });

        if (!updatedAdventure) {
          throw new Error('Falha ao atualizar aventura');
        }

        toast({
          title: 'Aventura atualizada!',
          description: 'As informações da aventura foram atualizadas com sucesso.',
        });

        navigate(`/adventures/${adventure.$id}/manage`);
      } else {
        const newAdventure = await createAdventure({
          title: values.title,
          description: values.description,
          file: values.file,
          status: values.status,
          isPublic: values.isPublic,
          createdBy: user.id,
        });

        if (!newAdventure) {
          throw new Error('Falha ao criar aventura');
        }

        toast({
          title: 'Aventura criada!',
          description: 'Nova aventura foi criada com sucesso.',
        });

        navigate('/adventures');
      }
    } catch (error: any) {
      toast({
        title: `Erro ao ${action === 'create' ? 'criar' : 'atualizar'} aventura`,
        description: error.message || 'Tente novamente mais tarde.',
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-9 w-full max-w-5xl"
      >
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Título da Aventura</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="shad-input"
                  placeholder="Digite o título da aventura..."
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Descrição (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  className="shad-textarea custom-scrollbar"
                  placeholder="Descreva a aventura, história, contexto..."
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        {/* Image Upload */}
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Imagem da Aventura</FormLabel>
              <FormControl>
                <FileUploader
                  fieldChange={field.onChange}
                  mediaUrl={adventure?.imageUrl}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Status da Aventura</FormLabel>
              <FormControl>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="active"
                      checked={field.value === 'active'}
                      onChange={() => field.onChange('active')}
                      className="w-4 h-4 text-primary-500 bg-dark-4 border-gray-300 focus:ring-primary-500"
                    />
                    <span className="text-light-1">Ativa</span>
                    <span className="text-xs text-light-4">
                      (Funcional e visível)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="inactive"
                      checked={field.value === 'inactive'}
                      onChange={() => field.onChange('inactive')}
                      className="w-4 h-4 text-primary-500 bg-dark-4 border-gray-300 focus:ring-primary-500"
                    />
                    <span className="text-light-1">Inativa</span>
                    <span className="text-xs text-light-4">
                      (Visível apenas para admins)
                    </span>
                  </label>
                </div>
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        {/* Visibilidade (isPublic) */}
        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Visibilidade da Aventura</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer p-4 border border-dark-4 rounded-lg hover:border-primary-500/50 transition-colors">
                    <input
                      type="radio"
                      checked={!field.value}
                      onChange={() => field.onChange(false)}
                      className="w-4 h-4 text-primary-500 bg-dark-4 border-gray-300 focus:ring-primary-500 mt-1"
                    />
                    <div>
                      <span className="text-light-1 font-medium">🔒 Aventura Privada</span>
                      <p className="text-xs text-light-4 mt-1">
                        Apenas usuários adicionados manualmente como participantes podem ver esta aventura e seus posts.
                        Você precisa gerenciar a lista de participantes.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer p-4 border border-dark-4 rounded-lg hover:border-primary-500/50 transition-colors">
                    <input
                      type="radio"
                      checked={field.value}
                      onChange={() => field.onChange(true)}
                      className="w-4 h-4 text-primary-500 bg-dark-4 border-gray-300 focus:ring-primary-500 mt-1"
                    />
                    <div>
                      <span className="text-light-1 font-medium">🌍 Aventura Pública</span>
                      <p className="text-xs text-light-4 mt-1">
                        Todos os usuários automaticamente têm acesso a esta aventura e podem ver seus posts.
                        Não é necessário adicionar participantes manualmente.
                      </p>
                    </div>
                  </label>
                </div>
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex gap-4 items-center justify-end">
          <Button
            type="button"
            className="shad-button_dark_4"
            onClick={() => navigate(-1)}
            disabled={isLoading}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex-center gap-2">
                <Loader size="sm" />
                <span>{action === 'create' ? 'Criando...' : 'Atualizando...'}</span>
              </div>
            ) : (
              <span>{action === 'create' ? 'Criar Aventura' : 'Atualizar Aventura'}</span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AdventureForm;