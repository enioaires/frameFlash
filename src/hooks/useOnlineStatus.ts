// ATUALIZAR src/hooks/useOnlineStatus.ts

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

  // Função para atualizar last seen com throttle
  const updateLastSeen = useCallback(async (force = false) => {
    // VERIFICAÇÕES MELHORADAS
    if (!isAuthenticated || !user.id || isUpdatingRef.current) {
      console.log('Skipping lastSeen update:', { 
        isAuthenticated, 
        userId: user.id, 
        isUpdating: isUpdatingRef.current 
      });
      return;
    }

    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    
    // Throttle: só atualiza se passou tempo suficiente ou forçado
    if (!force && timeSinceLastUpdate < 60000) {
      console.log('Throttling lastSeen update, time since last:', timeSinceLastUpdate);
      return;
    }

    isUpdatingRef.current = true;
    
    try {
      console.log('Updating lastSeen for user:', user.id);
      await updateUserLastSeen(user.id);
      lastUpdateRef.current = now;
      console.log('LastSeen updated successfully');
    } catch (error) {
      console.log('Error updating last seen:', error);
    } finally {
      isUpdatingRef.current = false;
    }
  }, [isAuthenticated, user.id]);

  // Configurar heartbeat - SÓ QUANDO AUTENTICADO
  useEffect(() => {
    if (!isAuthenticated || !user.id) {
      console.log('Not setting up heartbeat - not authenticated or no user ID');
      return;
    }

    console.log('Setting up online status heartbeat for user:', user.id);

    // Atualizar imediatamente
    updateLastSeen(true);

    // Configurar heartbeat
    const intervalMs = updateInterval * 60 * 1000;
    heartbeatInterval.current = setInterval(() => {
      console.log('Heartbeat tick - updating lastSeen');
      updateLastSeen();
    }, intervalMs);

    return () => {
      if (heartbeatInterval.current) {
        console.log('Cleaning up heartbeat interval');
        clearInterval(heartbeatInterval.current);
      }
    };
  }, [isAuthenticated, user.id, updateInterval, updateLastSeen]); // ADICIONAR user.id nas dependências

  // Rastrear visibilidade da página
  useEffect(() => {
    if (!enableVisibilityTracking || !isAuthenticated || !user.id) {
      return;
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible - updating lastSeen');
        updateLastSeen();
      }
    };

    const handleFocus = () => {
      console.log('Window focused - updating lastSeen');
      updateLastSeen();
    };

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastUpdateRef.current > 60000) { // 1 minuto
        console.log('User activity detected - updating lastSeen');
        updateLastSeen();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    // Rastrear atividade do usuário (mouse, teclado)
    document.addEventListener('mousedown', handleActivity);
    document.addEventListener('keydown', handleActivity);
    document.addEventListener('scroll', handleActivity);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('mousedown', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      document.removeEventListener('scroll', handleActivity);
    };
  }, [enableVisibilityTracking, isAuthenticated, user.id, updateLastSeen]); // ADICIONAR user.id

  // Atualizar antes de sair
  useEffect(() => {
    if (!enableBeforeUnload || !isAuthenticated || !user.id) {
      return;
    }

    const handleBeforeUnload = () => {
      console.log('Page unloading - updating lastSeen');
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