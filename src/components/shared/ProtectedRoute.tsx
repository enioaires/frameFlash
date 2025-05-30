import { Navigate, useLocation } from 'react-router-dom';

import Loader from '@/components/shared/Loader';
import React from 'react';
import { useIsAdmin } from '@/hooks/usePermissions';
import { useUserContext } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireAuth?: boolean;
  allowedRoles?: ('admin' | 'user')[];
  fallbackPath?: string;
  showLoader?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requireAuth = true,
  allowedRoles,
  fallbackPath = '/',
  showLoader = true
}) => {
  const { user, isAuthenticated, isLoading } = useUserContext();
  const isAdmin = useIsAdmin();
  const location = useLocation();

  // AGUARDAR CARREGAMENTO INICIAL (evita flash)
  if (isLoading && showLoader) {
    return (
      <div className="flex-center w-full h-screen bg-dark-1">
        <Loader text="Carregando..." />
      </div>
    );
  }

  // VERIFICAR AUTENTICAÇÃO SOMENTE APÓS CARREGAMENTO
  if (!isLoading && requireAuth && !isAuthenticated) {
    // Salvar a rota atual para redirecionar após login
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // VERIFICAR PERMISSÕES SOMENTE SE AUTENTICADO
  if (!isLoading && isAuthenticated) {
    // Verificar se precisa ser admin
    if (requireAdmin && !isAdmin) {
      return <Navigate to={fallbackPath} replace />;
    }

    // Verificar roles específicos
    if (allowedRoles && allowedRoles.length > 0) {
      const hasAllowedRole = allowedRoles.includes(user.role);
      if (!hasAllowedRole) {
        return <Navigate to={fallbackPath} replace />;
      }
    }
  }

  return <>{children}</>;
};

// Componente específico para rotas de admin
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireAdmin fallbackPath="/">
    {children}
  </ProtectedRoute>
);

// Componente para verificar permissões inline
export const PermissionGate: React.FC<{
  children: React.ReactNode;
  requireAdmin?: boolean;
  allowedRoles?: ('admin' | 'user')[];
  fallback?: React.ReactNode;
  show?: boolean;
}> = ({ 
  children, 
  requireAdmin = false, 
  allowedRoles,
  fallback = null,
  show = true
}) => {
  const { user, isLoading } = useUserContext();
  const isAdmin = useIsAdmin();

  // Aguardar carregamento
  if (isLoading) return <>{fallback}</>;

  if (!show) return <>{fallback}</>;

  // Verificar se precisa ser admin
  if (requireAdmin && !isAdmin) {
    return <>{fallback}</>;
  }

  // Verificar roles específicos
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.includes(user.role);
    if (!hasAllowedRole) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

// Hook para verificar se pode renderizar componente
export const useCanRender = (
  requireAdmin = false,
  allowedRoles?: ('admin' | 'user')[]
) => {
  const { user, isLoading } = useUserContext();
  const isAdmin = useIsAdmin();

  // Durante carregamento, não renderizar
  if (isLoading) return false;

  if (requireAdmin && !isAdmin) return false;
  
  if (allowedRoles && allowedRoles.length > 0) {
    return allowedRoles.includes(user.role);
  }

  return true;
};

// Componente para mostrar diferentes conteúdos baseado no role
export const RoleBasedRender: React.FC<{
  adminContent?: React.ReactNode;
  userContent?: React.ReactNode;
  guestContent?: React.ReactNode;
}> = ({ adminContent, userContent, guestContent }) => {
  const { isAuthenticated, isLoading } = useUserContext();
  const isAdmin = useIsAdmin();

  // Durante carregamento, não renderizar nada
  if (isLoading) return null;

  if (!isAuthenticated) {
    return <>{guestContent}</>;
  }

  if (isAdmin && adminContent) {
    return <>{adminContent}</>;
  }

  if (!isAdmin && userContent) {
    return <>{userContent}</>;
  }

  return null;
};

// Componente para exibir avisos de permissão
export const PermissionDeniedMessage: React.FC<{
  message?: string;
  showContactAdmin?: boolean;
  className?: string;
}> = ({ 
  message = "Você não tem permissão para acessar este recurso.",
  showContactAdmin = true,
  className = ""
}) => (
  <div className={`flex-center flex-col gap-4 py-10 ${className}`}>
    <div className="p-4 bg-red-500/10 rounded-full">
      <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <div className="text-center">
      <h3 className="text-lg font-semibold text-light-1 mb-2">Acesso Negado</h3>
      <p className="text-light-4 max-w-md">{message}</p>
      {showContactAdmin && (
        <p className="text-light-4 text-sm mt-2">
          Entre em contato com um administrador se precisar de acesso.
        </p>
      )}
    </div>
  </div>
);

export default ProtectedRoute;