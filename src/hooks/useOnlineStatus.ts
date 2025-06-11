import { useCallback, useEffect, useRef } from 'react';

import { updateUserLastSeen } from '@/lib/appwrite/auth/api';
import { useUserContext } from '@/context/AuthContext';

interface UseOnlineStatusOptions {
  updateInterval?: number; // em minutos
  enableVisibilityTracking?: boolean;
  enableBeforeUnload?: boolean;
}

export const useOnlineStatus = (options: UseOnlineStatusOptions = {}) => {
  const {
    updateInterval = 2, // 2 minutos por padrão
    enableVisibilityTracking = true,
    enableBeforeUnload = true
  } = options;

  const { user, isAuthenticated } = useUserContext();
  const heartbeatInterval = useRef<NodeJS.Timeout>();
  const lastUpdateRef = useRef<number>(0);
  const isUpdatingRef = useRef<boolean>(false);
  const hasInitializedRef = useRef<boolean>(false);

  // Função para atualizar last seen com throttle e retry
  const updateLastSeen = useCallback(async (force = false) => {
    // VERIFICAÇÕES MELHORADAS
    if (!isAuthenticated || !user.id || isUpdatingRef.current) {
      return;
    }

    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    
    // Throttle: só atualiza se passou tempo suficiente ou forçado
    if (!force && timeSinceLastUpdate < 60000) {
      return;
    }

    isUpdatingRef.current = true;
    
    try {
      await updateUserLastSeen(user.id);
      lastUpdateRef.current = now;
    } catch (error) {
      // Não loggar erros para não poluir console
      // console.log('Error updating last seen:', error);
    } finally {
      isUpdatingRef.current = false;
    }
  }, [isAuthenticated, user.id]);

  // Configurar heartbeat - SÓ QUANDO AUTENTICADO E NÃO INICIALIZADO
  useEffect(() => {
    if (!isAuthenticated || !user.id || hasInitializedRef.current) {
      return;
    }

    hasInitializedRef.current = true;

    // Atualizar imediatamente
    updateLastSeen(true);

    // Configurar heartbeat
    const intervalMs = updateInterval * 60 * 1000;
    heartbeatInterval.current = setInterval(() => {
      updateLastSeen();
    }, intervalMs);

    return () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
      hasInitializedRef.current = false;
    };
  }, [isAuthenticated, user.id, updateInterval, updateLastSeen]);

  // Rastrear visibilidade da página
  useEffect(() => {
    if (!enableVisibilityTracking || !isAuthenticated || !user.id) {
      return;
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateLastSeen();
      }
    };

    const handleFocus = () => {
      updateLastSeen();
    };

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastUpdateRef.current > 60000) { // 1 minuto
        updateLastSeen();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    // Rastrear atividade do usuário (throttled)
    document.addEventListener('mousedown', handleActivity);
    document.addEventListener('keydown', handleActivity);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('mousedown', handleActivity);
      document.removeEventListener('keydown', handleActivity);
    };
  }, [enableVisibilityTracking, isAuthenticated, user.id, updateLastSeen]);

  // Atualizar antes de sair
  useEffect(() => {
    if (!enableBeforeUnload || !isAuthenticated || !user.id) {
      return;
    }

    const handleBeforeUnload = () => {
      updateLastSeen(true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enableBeforeUnload, isAuthenticated, user.id, updateLastSeen]);

  return {
    updateLastSeen: () => updateLastSeen(true),
    isTracking: isAuthenticated && !!user.id
  };
};