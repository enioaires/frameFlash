import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useUserContext } from '@/context/AuthContext';

const OnlineStatusTracker = () => {
  const { isAuthenticated, user } = useUserContext();

  if(!isAuthenticated || !user.id) {
    return null; // Componente invisível
  }
  
  useOnlineStatus({
    updateInterval: 2,
    enableVisibilityTracking: true,
    enableBeforeUnload: true
  });

  return null; // Componente invisível
};

export default OnlineStatusTracker;