import {
  Activity,
  ArrowLeft,
  Calendar,
  Edit,
  Eye,
  EyeOff,
  Settings,
  Trash2,
  Users
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import React, { useState } from 'react';
import {
  useDeleteAdventure,
  useGetAdventureById,
  useGetAdventureParticipants,
  useUpdateAdventure
} from '@/lib/react-query/adventures';

import AdventureParticipantsList from '@/components/shared/AdventureParticipantsList';
import { Button } from '@/components/ui/button';
import Loader from '@/components/shared/Loader';
import { cn } from '@/lib/utils';
import { isAdmin } from '@/lib/adventures';
import { multiFormatDateString } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useUserContext } from '@/context/AuthContext';

type TabType = 'overview' | 'participants' | 'settings';

const AdventureManagement = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const { data: adventure, isLoading, isError } = useGetAdventureById(id || '');
  const { data: participants, isLoading: isLoadingParticipants } = useGetAdventureParticipants(id || '');
  const { mutate: updateAdventure, isPending: isUpdating } = useUpdateAdventure();
  const { mutate: deleteAdventure, isPending: isDeleting } = useDeleteAdventure();

  const userIsAdmin = isAdmin(user);

  // Verificar se o usuário tem permissão para gerenciar
  React.useEffect(() => {
    if (!isLoading && !userIsAdmin) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para gerenciar aventuras."
      });
      navigate('/adventures');
    }
  }, [isLoading, userIsAdmin, navigate, toast]);

  const handleToggleStatus = () => {
    if (!adventure) return;

    const newStatus = adventure.status === 'active' ? 'inactive' : 'active';

    updateAdventure({
      adventureId: adventure.$id,
      title: adventure.title,
      description: adventure.description,
      file: [],
      status: newStatus,
      imageId: adventure.imageId,
      imageUrl: adventure.imageUrl,
    }, {
      onSuccess: () => {
        toast({
          title: `Aventura ${newStatus === 'active' ? 'ativada' : 'desativada'}`,
          description: `A aventura agora está ${newStatus === 'active' ? 'visível para todos os participantes' : 'visível apenas para admins'}.`
        });
      },
      onError: (error: any) => {
        toast({
          title: "Erro ao alterar status",
          description: error.message || "Não foi possível alterar o status da aventura."
        });
      }
    });
  };

  const handleDeleteAdventure = () => {
    if (!adventure) return;

    const confirmMessage = `Tem certeza que deseja deletar a aventura "${adventure.title}"?\n\nEsta ação não pode ser desfeita e todos os participantes serão removidos.`;

    if (confirm(confirmMessage)) {
      deleteAdventure({
        adventureId: adventure.$id,
        imageId: adventure.imageId
      }, {
        onSuccess: () => {
          toast({
            title: "Aventura deletada",
            description: "A aventura foi removida permanentemente do sistema."
          });
          navigate('/adventures');
        },
        onError: (error: any) => {
          toast({
            title: "Erro ao deletar aventura",
            description: error.message || "Não foi possível deletar a aventura."
          });
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1">
        <div className="common-container">
          <Loader text="Carregando aventura..." />
        </div>
      </div>
    );
  }

  if (isError || !adventure) {
    return (
      <div className="flex flex-1">
        <div className="common-container">
          <div className="flex-center flex-col gap-4">
            <p className="body-medium text-light-1">Aventura não encontrada</p>
            <Link to="/adventures">
              <Button variant="ghost" className="text-primary-500">
                Voltar para aventuras
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: 'active' | 'inactive') => {
    return status === 'active'
      ? { text: 'Ativa', className: 'bg-green-500/20 text-green-400 border-green-500/30' }
      : { text: 'Inativa', className: 'bg-red-500/20 text-red-400 border-red-500/30' };
  };

  const statusBadge = getStatusBadge(adventure.status);

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: Eye },
    { id: 'participants', label: 'Participantes', icon: Users },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ] as const;

  return (
    <div className="flex flex-1">
      <div className="common-container">
        {/* Header */}
        <div className="flex items-center gap-4 w-full max-w-5xl">
          <Button
            onClick={() => navigate('/adventures')}
            variant="ghost"
            className="shad-button_ghost"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="flex-1">
            <h1 className="h3-bold md:h2-bold text-left">
              Gerenciar Aventura
            </h1>
          </div>
        </div>

        {/* Adventure Header Card */}
        <div className="bg-dark-2 rounded-3xl border border-dark-4 p-6 w-full max-w-5xl">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Image */}
            <div className="flex-shrink-0">
              <img
                src={adventure.imageUrl || '/assets/icons/profile-placeholder.svg'}
                alt={adventure.title}
                className="w-full lg:w-48 h-48 object-cover rounded-2xl"
              />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className='mb-6'>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-light-1">
                      {adventure.title}
                    </h2>
                    <span className={cn(
                      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
                      statusBadge.className
                    )}>
                      {statusBadge.text}
                    </span>
                  </div>

                  {adventure.description && (
                    <p className="text-light-3 leading-relaxed">
                      {adventure.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-500">
                    {participants?.documents.length || 0}
                  </p>
                  <p className="text-light-4 text-sm">Participantes</p>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-500">
                    {adventure.status === 'active' ? 'Ativa' : 'Inativa'}
                  </p>
                  <p className="text-light-4 text-sm">Status</p>
                </div>

                <div className="text-center">
                  <p className="text-2xl text-light-1">
                    {new Date(adventure.$createdAt).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-light-4 text-sm">Criada em</p>
                </div>

                <div className="text-center">
                  <p className="text-2xl text-light-1">
                    {new Date(adventure.$updatedAt).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-light-4 text-sm">Atualizada</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-dark-4 w-full max-w-5xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2",
                activeTab === tab.id
                  ? "border-primary-500 text-primary-500"
                  : "border-transparent text-light-4 hover:text-light-2"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="w-full max-w-5xl">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-dark-2 rounded-lg p-6 border border-dark-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="w-5 h-5 text-primary-500" />
                    <h3 className="font-semibold text-light-1">Status da Aventura</h3>
                  </div>
                  <p className="text-light-3 mb-4">
                    {adventure.status === 'active'
                      ? "Esta aventura está ativa e visível para todos os participantes."
                      : "Esta aventura está inativa e visível apenas para administradores."
                    }
                  </p>
                  <div className='flex w-full justify-end'>
                    <Button
                      onClick={handleToggleStatus}
                      disabled={isUpdating}
                      className={cn(
                        adventure.status === 'active'
                          ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30"
                          : "bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                      )}
                    >
                      {isUpdating ? (
                        <Loader size="sm" />
                      ) : (
                        <>
                          {adventure.status === 'active' ? (
                            <EyeOff className="w-4 h-4 mr-2" />
                          ) : (
                            <Eye className="w-4 h-4 mr-2" />
                          )}
                          {adventure.status === 'active' ? 'Desativar' : 'Ativar'}
                        </>
                      )}
                    </Button>

                  </div>
                </div>

                <div className="bg-dark-2 rounded-lg p-6 border border-dark-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-5 h-5 text-primary-500" />
                    <h3 className="font-semibold text-light-1">Informações</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-light-4 min-w-[120px]">Criada em:</span>
                      <span className="text-light-1 text-right">
                        {new Date(adventure.$createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-light-4 min-w-[120px]">Última atualização:</span>
                      <span className="text-light-1 text-right">
                        {new Date(adventure.$updatedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-light-4 min-w-[120px]">ID da Aventura:</span>
                      <span className="text-light-1 font-mono text-xs text-right">
                        {adventure.$id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'participants' && (
            <AdventureParticipantsList
              adventureId={adventure.$id}
              participants={participants?.documents || []}
              isLoading={isLoadingParticipants}
            />
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-dark-2 rounded-lg p-6 border border-dark-4">
                <h3 className="font-semibold text-light-1 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary-500" />
                  Configurações Avançadas
                </h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-light-1 mb-2">Editar Aventura</h4>
                    <p className="text-light-4 text-sm mb-3">
                      Altere o título, descrição, imagem ou status da aventura.
                    </p>
                    <Link to={`/adventures/${adventure.$id}/edit`}>
                      <Button className="shad-button_primary">
                        <Edit className="w-4 h-4 mr-2" />
                        Editar Aventura
                      </Button>
                    </Link>
                  </div>

                  <hr className="border-dark-4" />

                  <div>
                    <h4 className="font-medium text-red-400 mb-2">Zona de Perigo</h4>
                    <p className="text-light-4 text-sm mb-3">
                      Deletar a aventura irá remover permanentemente todos os dados,
                      incluindo participantes e associações com posts. Esta ação não pode ser desfeita.
                    </p>
                    <Button
                      onClick={handleDeleteAdventure}
                      disabled={isDeleting}
                      className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                    >
                      {isDeleting ? (
                        <Loader size="sm" />
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Deletar Aventura
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdventureManagement;