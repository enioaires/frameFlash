import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Loader from '@/components/shared/Loader';
import React from 'react';
import { isAdmin } from '@/lib/adventures'; // IMPORTAÇÃO CORRETA
import { useUserContext } from '@/context/AuthContext';

export interface EmptyStateProps {
  type?: 'loading' | 'no_adventures' | 'no_posts' | 'no_adventures_available' | 'no_results' | 'empty';
  title?: string;
  description?: string;
  icon?: string;
  showLoader?: boolean;
  showContactInfo?: boolean;
  showCreateButton?: boolean;
  createButtonText?: string;
  createButtonLink?: string;
  onRetry?: () => void;
  children?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'empty',
  title,
  description,
  icon,
  showLoader = false,
  showContactInfo = false,
  showCreateButton = false,
  createButtonText = 'Criar',
  createButtonLink = '/',
  onRetry,
  children,
  className = ''
}) => {
  const { user } = useUserContext(); // USAR CONTEXT DIRETAMENTE
  const userIsAdmin = isAdmin(user); // VERIFICAÇÃO CORRETA

  // Configurações padrão por tipo
  const getDefaultConfig = () => {
    switch (type) {
      case 'loading':
        return {
          title: 'Carregando...',
          description: 'Aguarde enquanto carregamos o conteúdo.',
          icon: '⏳',
          showLoader: true,
        };

      case 'no_adventures':
        return {
          title: 'Você não está em nenhuma aventura',
          description: 'Para começar a ver posts e participar da comunidade, você precisa ser adicionado a uma aventura por um mestre.',
          icon: '🏰',
          showContactInfo: true,
        };

      case 'no_posts':
        return {
          title: 'Nenhum post encontrado',
          description: 'Ainda não há posts para exibir. Que tal criar o primeiro?',
          icon: '📝',
          showCreateButton: userIsAdmin,
          createButtonText: 'Criar Post',
          createButtonLink: '/create-post',
        };

      case 'no_adventures_available':
        return {
          title: userIsAdmin ? 'Nenhuma aventura criada ainda' : 'Nenhuma aventura disponível',
          description: userIsAdmin
            ? 'Comece criando sua primeira aventura para organizar suas sessões de RPG.'
            : 'Aguarde ser convidado para uma aventura pelos mestres.',
          icon: '🎭',
          showCreateButton: userIsAdmin,
          createButtonText: 'Criar Aventura',
          createButtonLink: '/adventures/create',
        };

      case 'no_results':
        return {
          title: 'Nenhum resultado encontrado',
          description: '',
          icon: '🔍',
        };

      default:
        return {
          title: 'Nenhum conteúdo',
          description: 'Não há conteúdo para exibir no momento.',
          icon: '📭',
        };
    }
  };

  const config = getDefaultConfig();
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const finalIcon = icon || config.icon;
  const shouldShowLoader = showLoader || config.showLoader;
  const shouldShowContactInfo = showContactInfo || config.showContactInfo;
  const shouldShowCreateButton = showCreateButton !== undefined ? showCreateButton : config.showCreateButton;
  const finalCreateButtonText = createButtonText || config.createButtonText;
  const finalCreateButtonLink = createButtonLink || config.createButtonLink;

  return (
    <div className={`flex-center flex-col gap-6 py-16 px-4 text-center ${className}`}>
      {/* Icon/Loader */}
      <div className="flex-center">
        {shouldShowLoader ? (
          <Loader text="" />
        ) : (
          <div className="mb-2" role="img" aria-label={finalTitle}>
            {finalIcon.startsWith('http') ? (
              <img src={finalIcon} alt={finalTitle} className="size-42 object-contain" />
            ) : (
              <span className="text-6xl">{finalIcon}</span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-md space-y-4">
        <h3 className="text-xl font-semibold text-light-1">
          {finalTitle}
        </h3>

        <p className="text-light-4 leading-relaxed">
          {finalDescription}
        </p>

        {/* Contact Info for users without adventures */}
        {shouldShowContactInfo && (
          <div className="bg-dark-3 rounded-lg p-4 border border-dark-4 mt-6">
            <h4 className="font-medium text-light-1 mb-2">Como participar?</h4>
            <div className="text-sm text-light-3 space-y-2">
              <p>• Entre em contato com um mestre/administrador</p>
              <p>• Aguarde o convite para uma aventura</p>
              <p>• Comece a participar e criar memórias épicas!</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-6">
          {shouldShowCreateButton && (
            <Link to={finalCreateButtonLink || '/'}>
              <Button className="shad-button_primary">
                {finalCreateButtonText}
              </Button>
            </Link>
          )}

          {onRetry && (
            <Button
              onClick={onRetry}
              variant="ghost"
              className="text-primary-500 hover:text-primary-400"
            >
              Tentar novamente
            </Button>
          )}
        </div>

        {/* Custom children content */}
        {children && (
          <div className="mt-6">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

// Componentes especializados para casos específicos
export const NoAdventuresState: React.FC<{ className?: string }> = ({ className }) => (
  <EmptyState
    type="no_adventures"
    className={className}
  />
);

export const NoPostsState: React.FC<{
  hasAdventures?: boolean;
  className?: string;
}> = ({ hasAdventures = false, className }) => (
  <EmptyState
    type="no_posts"
    description={hasAdventures
      ? "Ainda não há posts nas suas aventuras. Que tal criar o primeiro?"
      : "Você precisa participar de uma aventura para ver e criar posts."
    }
    className={className}
  />
);

export const LoadingState: React.FC<{
  text?: string;
  className?: string;
}> = ({ text = "Carregando conteúdo...", className }) => (
  <EmptyState
    type="loading"
    description={text}
    className={className}
  />
);

export const NoSearchResultsState: React.FC<{
  searchTerm?: string;
  onClearSearch?: () => void;
  className?: string;
}> = ({ searchTerm, onClearSearch, className }) => (
  <EmptyState
    type="no_results"
    title="Nenhum resultado encontrado"
    description={searchTerm
      ? `Não encontramos resultados para "${searchTerm}". Tente outros termos de busca.`
      : "Nenhum item corresponde aos filtros aplicados."
    }
    className={className}
  >
    {onClearSearch && (
      <Button
        onClick={onClearSearch}
        variant="ghost"
        className="text-primary-500 hover:text-primary-400"
      >
        Limpar filtros
      </Button>
    )}
  </EmptyState>
);

export const NoAdventuresAvailableState: React.FC<{ className?: string }> = ({ className }) => (
  <EmptyState
    type="no_adventures_available"
    className={className}
  />
);

export default EmptyState;