import { Crown, Search, UserMinus, UserPlus, Users } from 'lucide-react';
import React, { useState } from 'react';
import { useAddParticipant, useRemoveParticipant } from '@/lib/react-query/adventures';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Loader from '@/components/shared/Loader';
import { Models } from 'appwrite';
import { cn } from '@/lib/utils';
import { useGetUsers } from '@/lib/react-query/user';
import { useToast } from '@/components/ui/use-toast';
import { useUserContext } from '@/context/AuthContext';

interface AdventureParticipantsListProps {
  adventureId: string;
  participants: Models.Document[];
  isLoading?: boolean;
  className?: string;
}

const AdventureParticipantsList: React.FC<AdventureParticipantsListProps> = ({
  adventureId,
  participants,
  isLoading = false,
  className = ""
}) => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: allUsers, isLoading: isLoadingUsers } = useGetUsers();
  const { mutate: addParticipant, isPending: isAdding } = useAddParticipant();
  const { mutate: removeParticipant, isPending: isRemoving } = useRemoveParticipant();

  // IDs dos participantes atuais
  const participantIds = participants.map(p => p.userId);

  // Usuários disponíveis para adicionar (não são participantes)
  const availableUsers = allUsers?.documents.filter(
    u => !participantIds.includes(u.$id) && u.$id !== user.id
  ) || [];

  // Filtrar usuários por busca
  const filteredAvailableUsers = availableUsers.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddParticipant = (userId: string) => {
    addParticipant({
      adventureId,
      userId,
      addedBy: user.id
    }, {
      onSuccess: () => {
        toast({
          title: "Participante adicionado",
          description: "Usuário foi adicionado à aventura com sucesso."
        });
        setSearchTerm("");
      },
      onError: (error: any) => {
        toast({
          title: "Erro ao adicionar participante",
          description: error.message || "Não foi possível adicionar o participante."
        });
      }
    });
  };

  const handleRemoveParticipant = (userId: string, userName: string) => {
    if (confirm(`Tem certeza que deseja remover ${userName} da aventura?`)) {
      removeParticipant({
        adventureId,
        userId
      }, {
        onSuccess: () => {
          toast({
            title: "Participante removido",
            description: `${userName} foi removido da aventura.`
          });
        },
        onError: (error: any) => {
          toast({
            title: "Erro ao remover participante",
            description: error.message || "Não foi possível remover o participante."
          });
        }
      });
    }
  };

  if (isLoading) {
    return <Loader text="Carregando participantes..." />;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-light-1">
            Participantes ({participants.length})
          </h3>
        </div>
        
        <Button
          onClick={() => setShowAddModal(!showAddModal)}
          className="shad-button_primary"
          disabled={isAdding}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Adicionar
        </Button>
      </div>

      {/* Add Participants Section */}
      {showAddModal && (
        <div className="bg-dark-3 border border-dark-4 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-light-4" />
            <Input
              type="text"
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="shad-input"
            />
          </div>

          <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2">
            {isLoadingUsers ? (
              <Loader size="sm" text="Carregando usuários..." />
            ) : filteredAvailableUsers.length === 0 ? (
              <p className="text-light-4 text-center py-4">
                {searchTerm ? "Nenhum usuário encontrado" : "Todos os usuários já são participantes"}
              </p>
            ) : (
              filteredAvailableUsers.map((availableUser) => (
                <div
                  key={availableUser.$id}
                  className="flex items-center justify-between p-3 bg-dark-2 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={availableUser.imageUrl || '/assets/icons/profile-placeholder.svg'}
                      alt={availableUser.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-light-1 font-medium">
                          {availableUser.name}
                        </p>
                        {availableUser.role === 'admin' && (
                          <Crown className="w-3 h-3 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-light-4 text-sm">
                        @{availableUser.username}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleAddParticipant(availableUser.$id)}
                    disabled={isAdding}
                    size="sm"
                    className="shad-button_primary"
                  >
                    {isAdding ? <Loader size="sm" /> : <UserPlus className="w-4 h-4" />}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Current Participants List */}
      <div className="space-y-3">
        {participants.length === 0 ? (
          <div className="text-center py-8 bg-dark-3 rounded-lg border border-dark-4">
            <Users className="w-12 h-12 text-light-4 mx-auto mb-3" />
            <p className="text-light-4">Nenhum participante ainda</p>
            <p className="text-light-4 text-sm mt-1">
              Adicione usuários para começar a aventura
            </p>
          </div>
        ) : (
          participants.map((participant) => {
            // Buscar dados do usuário participante
            const participantUser = allUsers?.documents.find(u => u.$id === participant.userId);
            
            if (!participantUser) {
              return (
                <div key={participant.$id} className="flex items-center justify-between p-4 bg-dark-3 rounded-lg border border-dark-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-dark-4 rounded-full animate-pulse" />
                    <div>
                      <div className="h-4 bg-dark-4 rounded w-24 animate-pulse mb-1" />
                      <div className="h-3 bg-dark-4 rounded w-16 animate-pulse" />
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={participant.$id}
                className="flex items-center justify-between p-4 bg-dark-3 rounded-lg border border-dark-4 hover:border-dark-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={participantUser.imageUrl || '/assets/icons/profile-placeholder.svg'}
                    alt={participantUser.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-light-1 font-medium">
                        {participantUser.name}
                      </p>
                      {participantUser.role === 'admin' && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-light-4 text-sm">
                      @{participantUser.username}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-light-4 bg-dark-4 px-2 py-1 rounded">
                    Desde {new Date(participant.$createdAt).toLocaleDateString('pt-BR')}
                  </span>
                  
                  <Button
                    onClick={() => handleRemoveParticipant(participantUser.$id, participantUser.name)}
                    disabled={isRemoving}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    {isRemoving ? (
                      <Loader size="sm" />
                    ) : (
                      <UserMinus className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stats */}
      {participants.length > 0 && (
        <div className="bg-dark-3 rounded-lg p-4 border border-dark-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-500">
                {participants.length}
              </p>
              <p className="text-light-4 text-sm">
                Participante{participants.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-500">
                {allUsers?.documents.filter(u => u.role === 'admin' && participantIds.includes(u.$id)).length || 0}
              </p>
              <p className="text-light-4 text-sm">
                Admin{(allUsers?.documents.filter(u => u.role === 'admin' && participantIds.includes(u.$id)).length || 0) !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Versão compacta para exibir apenas a lista
export const CompactParticipantsList: React.FC<{
  participants: Models.Document[];
  maxDisplay?: number;
  className?: string;
}> = ({ participants, maxDisplay = 5, className = "" }) => {
  const displayParticipants = participants.slice(0, maxDisplay);
  const remainingCount = participants.length - maxDisplay;

  if (participants.length === 0) {
    return (
      <div className={cn("text-light-4 text-sm", className)}>
        Nenhum participante
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex -space-x-2">
        {displayParticipants.map((participant, index) => (
          <img
            key={participant.$id}
            src={participant.user?.imageUrl || '/assets/icons/profile-placeholder.svg'}
            alt="Participante"
            className="w-6 h-6 rounded-full border-2 border-dark-2 object-cover"
            style={{ zIndex: displayParticipants.length - index }}
          />
        ))}
      </div>
      
      <span className="text-light-4 text-sm">
        {participants.length} participante{participants.length !== 1 ? 's' : ''}
        {remainingCount > 0 && ` (+${remainingCount})`}
      </span>
    </div>
  );
};

// Loading skeleton
export const ParticipantsListSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="h-6 bg-dark-3 rounded w-40 animate-pulse" />
      <div className="h-10 bg-dark-3 rounded w-24 animate-pulse" />
    </div>
    
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="flex items-center justify-between p-4 bg-dark-3 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-dark-4 rounded-full animate-pulse" />
          <div>
            <div className="h-4 bg-dark-4 rounded w-24 animate-pulse mb-1" />
            <div className="h-3 bg-dark-4 rounded w-16 animate-pulse" />
          </div>
        </div>
        <div className="h-8 bg-dark-4 rounded w-8 animate-pulse" />
      </div>
    ))}
  </div>
);

export default AdventureParticipantsList;