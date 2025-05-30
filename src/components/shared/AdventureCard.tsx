import { Calendar, Edit, Globe, Lock, Users } from 'lucide-react';

import { Link } from 'react-router-dom';
import { Models } from 'appwrite';
import React from 'react';
import { isAdmin } from '@/lib/adventures';
import { multiFormatDateString } from '@/lib/utils';
import { useUserContext } from '@/context/AuthContext';

interface AdventureCardProps {
  adventure: Models.Document;
  participantCount?: number;
  showManageButton?: boolean;
  className?: string;
}

const AdventureCard: React.FC<AdventureCardProps> = ({
  adventure,
  participantCount = 0,
  showManageButton = true,
  className = ''
}) => {
  const { user } = useUserContext();
  const canManage = isAdmin(user);

  const getStatusBadge = (status: 'active' | 'inactive', isPublic: boolean = false) => {
    if (status === 'inactive') {
      return {
        text: 'Inativa',
        className: 'bg-red-500/20 text-red-400 border-red-500/30',
        icon: null
      };
    }
    
    if (isPublic) {
      return {
        text: 'Pública',
        className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        icon: <Globe className="w-3 h-3" />
      };
    }
    
    return {
      text: 'Privada',
      className: 'bg-green-500/20 text-green-400 border-green-500/30',
      icon: <Lock className="w-3 h-3" />
    };
  };

  const statusBadge = getStatusBadge(adventure.status, adventure.isPublic);

  return (
    <div className={`bg-dark-2 rounded-3xl border border-dark-4 overflow-hidden hover:border-primary-500/50 transition-all duration-300 group ${className}`}>
      {/* Image Section */}
      <div className="relative">
        <img
          src={adventure.imageUrl || '/assets/icons/profile-placeholder.svg'}
          alt={adventure.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Status Badges */}
        <div className="absolute top-3 right-3 flex gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusBadge.className}`}>
            {statusBadge.icon}
            {statusBadge.text}
          </span>
        </div>

        {/* Public Adventure Indicator */}
        {adventure.isPublic && adventure.status === 'active' && (
          <div className="absolute top-3 left-3">
            <div className="bg-blue-500/90 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Acesso Livre
            </div>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
      </div>

      {/* Content Section */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-light-1 line-clamp-1 group-hover:text-primary-500 transition-colors">
            {adventure.title}
          </h3>
        </div>

        {/* Description */}
        {adventure.description && (
          <p className="text-light-3 text-sm line-clamp-2 mb-4">
            {adventure.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-light-4 text-sm mb-4">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>
              {adventure.isPublic ? 'Todos os usuários' : `${participantCount} participante${participantCount !== 1 ? 's' : ''}`}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{multiFormatDateString(adventure.$createdAt)}</span>
          </div>
        </div>

        {/* Visibility Info */}
        <div className="mb-4 p-2 bg-dark-3 rounded-lg">
          <div className="flex items-center gap-2 text-xs">
            {adventure.isPublic ? (
              <>
                <Globe className="w-3 h-3 text-blue-400" />
                <span className="text-blue-400 font-medium">Aventura Pública</span>
                <span className="text-light-4">• Todos podem ver posts desta aventura</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3 text-green-400" />
                <span className="text-green-400 font-medium">Aventura Privada</span>
                <span className="text-light-4">• Apenas participantes veem os posts</span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div />

          {canManage && showManageButton && (
            <Link
              to={`/adventures/${adventure.$id}/manage`}
              className="flex items-center gap-1 px-3 py-1.5 bg-dark-3 hover:bg-dark-4 text-light-1 rounded-lg text-sm transition-colors"
            >
              <Edit className="w-3 h-3" />
              Gerenciar
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

// Versão compacta para seleção
export const CompactAdventureCard: React.FC<{
  adventure: Models.Document;
  isSelected?: boolean;
  onClick?: () => void;
}> = ({ adventure, isSelected = false, onClick }) => {
  const getStatusBadge = (status: 'active' | 'inactive', isPublic: boolean = false) => {
    if (status === 'inactive') {
      return 'bg-red-500/20 text-red-400';
    }
    return isPublic 
      ? 'bg-blue-500/20 text-blue-400'
      : 'bg-green-500/20 text-green-400';
  };

  const statusBadge = getStatusBadge(adventure.status, adventure.isPublic);

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isSelected
          ? 'border-primary-500 bg-primary-500/10'
          : 'border-dark-4 hover:border-dark-3 bg-dark-3 hover:bg-dark-2'
        }`}
    >
      <img
        src={adventure.imageUrl || '/assets/icons/profile-placeholder.svg'}
        alt={adventure.title}
        className="w-12 h-12 rounded-lg object-cover"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-light-1 truncate">
            {adventure.title}
          </h4>
          <div className="flex items-center gap-1">
            <span className={`px-2 py-0.5 rounded text-xs ${statusBadge}`}>
              {adventure.status === 'active' 
                ? (adventure.isPublic ? 'Pública' : 'Privada')
                : 'Inativa'
              }
            </span>
            {adventure.isPublic && adventure.status === 'active' && (
              <Globe className="w-3 h-3 text-blue-400" />
            )}
          </div>
        </div>

        {adventure.description && (
          <p className="text-sm text-light-4 truncate">
            {adventure.description}
          </p>
        )}
      </div>
    </div>
  );
};

// Versão para loading
export const AdventureCardSkeleton: React.FC = () => (
  <div className="bg-dark-2 rounded-3xl border border-dark-4 overflow-hidden animate-pulse">
    <div className="h-48 bg-dark-3" />
    <div className="p-5">
      <div className="h-6 bg-dark-3 rounded mb-3" />
      <div className="h-4 bg-dark-3 rounded mb-2" />
      <div className="h-4 bg-dark-3 rounded w-3/4 mb-4" />
      <div className="flex gap-4">
        <div className="h-4 bg-dark-3 rounded w-20" />
        <div className="h-4 bg-dark-3 rounded w-24" />
      </div>
      <div className="h-8 bg-dark-3 rounded mt-4" />
    </div>
  </div>
);

export default AdventureCard;