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
    if (!isAuthenticated || !user.id || isUpdatingRef.current) return;

    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    
    // Throttle: só atualiza se passou tempo suficiente ou forçado
    if (!force && timeSinceLastUpdate < 60000) return; // 1 minuto mínimo

    isUpdatingRef.current = true;
    
    try {
      await updateUserLastSeen(user.id);
      lastUpdateRef.current = now;
    } catch (error) {
      console.log('Error updating last seen:', error);
    } finally {
      isUpdatingRef.current = false;
    }
  }, [isAuthenticated, user.id]);

  // Configurar heartbeat
  useEffect(() => {
    if (!isAuthenticated) return;

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
    };
  }, [isAuthenticated, updateInterval, updateLastSeen]);

  // Rastrear visibilidade da página
  useEffect(() => {
    if (!enableVisibilityTracking || !isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Página ficou visível
        updateLastSeen();
      }
    };

    const handleFocus = () => updateLastSeen();
    const handleActivity = () => {
      // Throttle para atividade do usuário
      const now = Date.now();
      if (now - lastUpdateRef.current > 60000) { // 1 minuto
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
  }, [enableVisibilityTracking, isAuthenticated, updateLastSeen]);

  // Atualizar antes de sair
  useEffect(() => {
    if (!enableBeforeUnload || !isAuthenticated) return;

    const handleBeforeUnload = () => {
      // Usar sendBeacon se disponível para garantir que seja enviado
      if (navigator.sendBeacon('/api/updateLastSeen', JSON.stringify({ userId: user.id }))) {
        const data = new FormData();
        data.append('userId', user.id);
        data.append('lastSeen', new Date().toISOString());
        
        // Aqui você precisaria de um endpoint específico para sendBeacon
        // Por simplicidade, vamos usar o método normal
      }
      
      updateLastSeen(true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enableBeforeUnload, isAuthenticated, user.id, updateLastSeen]);

  return {
    updateLastSeen: () => updateLastSeen(true),
    isTracking: isAuthenticated
  };
};