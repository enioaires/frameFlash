import { IContextType, IUser } from "@/types";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getCurrentUser, initializeUserLastSeen } from "@/lib/appwrite/auth/api";
import { useLocation, useNavigate } from "react-router-dom";

import { isAdminById } from "@/lib/adventures";
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export const INITIAL_USER = {
  id: "",
  name: "",
  email: "",
  username: "",
  imageUrl: "",
  bio: "",
  role: "user" as "admin" | "user",
};

const INITIAL_STATE = {
  user: INITIAL_USER,
  isLoading: false,
  isAuthenticated: false,
  setUser: () => {},
  setIsAuthenticated: () => {},
  checkAuthUser: async () => false as boolean,
};

const AuthContext = createContext<IContextType>(INITIAL_STATE);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser>(INITIAL_USER);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  
  // Usar refs para evitar múltiplas chamadas simultâneas
  const initializingRef = useRef<boolean>(false);
  const checkingAuthRef = useRef<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();

  const checkAuthUser = async () => {
    // Evitar múltiplas verificações simultâneas
    if (checkingAuthRef.current) {
      console.log('Auth check already in progress, skipping...');
      return isAuthenticated;
    }

    checkingAuthRef.current = true;
    setIsLoading(true);
    
    try {
      const currentAccount = await getCurrentUser();

      if (currentAccount) {
        // VERIFICAR E INICIALIZAR lastSeen SE NECESSÁRIO
        let userWithLastSeen = currentAccount;
        if (!currentAccount.lastSeen) {
          console.log('Inicializando lastSeen para usuário:', currentAccount.name);
          try {
            const initialized = await initializeUserLastSeen(currentAccount.$id);
            if (initialized) {
              userWithLastSeen = initialized;
            }
          } catch (error) {
            console.warn('Failed to initialize lastSeen:', error);
          }
        }

        // VERIFICAR SE O USUÁRIO TEM ROLE DEFINIDA
        let userRole = userWithLastSeen.role;
        
        // FALLBACK: Se não tem role, verificar por ID (transição)
        if (!userRole) {
          userRole = isAdminById(userWithLastSeen.$id) ? 'admin' : 'user';
        }

        const userData = {
          id: userWithLastSeen.$id,
          name: userWithLastSeen.name,
          email: userWithLastSeen.email,
          username: userWithLastSeen.username || userWithLastSeen.name,
          imageUrl: userWithLastSeen.imageUrl,
          bio: userWithLastSeen.bio || "",
          role: userRole,
        };

        setUser(userData);
        setIsAuthenticated(true);
        return true;
      }

      // Se não há usuário autenticado, limpar estado
      setUser(INITIAL_USER);
      setIsAuthenticated(false);
      return false;
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(INITIAL_USER);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
      setHasInitialized(true);
      checkingAuthRef.current = false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      // Evitar múltiplas inicializações
      if (initializingRef.current) {
        console.log('Auth initialization already in progress, skipping...');
        return;
      }

      initializingRef.current = true;

      try {
        const cookieFallback = localStorage.getItem("cookieFallback");
        
        if (
          cookieFallback === "[]" ||
          cookieFallback === null ||
          cookieFallback === undefined
        ) {
          setIsLoading(false);
          setHasInitialized(true);
          return;
        }

        const isAuth = await checkAuthUser();
        
        // Limpar cookie inválido
        if (!isAuth && cookieFallback && cookieFallback !== "[]") {
          console.log('Clearing invalid auth cookie');
          localStorage.removeItem("cookieFallback");
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem("cookieFallback");
        setIsLoading(false);
        setHasInitialized(true);
      } finally {
        initializingRef.current = false;
      }
    };

    initializeAuth();
  }, []); // Executar apenas uma vez

  // Hook de online status - só executar após autenticação
  useOnlineStatus({
    updateInterval: 2,
    enableVisibilityTracking: true,
    enableBeforeUnload: true
  });

  // Navegação automática
  useEffect(() => {
    const authRoutes = ["/sign-in", "/sign-up"];
    const isOnAuthRoute = authRoutes.includes(location.pathname);

    if (hasInitialized && !isAuthenticated && !isLoading && !isOnAuthRoute) {
      const cookieFallback = localStorage.getItem("cookieFallback");
      if (
        cookieFallback === "[]" ||
        cookieFallback === null ||
        cookieFallback === undefined
      ) {
        navigate("/sign-in");
      }
    }
  }, [hasInitialized, isAuthenticated, isLoading, location.pathname, navigate]);

  const value = {
    user,
    setUser,
    isLoading,
    isAuthenticated,
    setIsAuthenticated,
    checkAuthUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

export const useUserContext = () => useContext(AuthContext);

export const useIsAdmin = () => {
  const { user } = useUserContext();
  return user.role === 'admin';
};

export const useCanAccessAdminFeatures = () => {
  const { user } = useUserContext();
  return user.role === 'admin' || isAdminById(user.id);
};