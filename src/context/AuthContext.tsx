// ATUALIZAR src/context/AuthContext.tsx

import { IContextType, IUser } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, initializeUserLastSeen } from "@/lib/appwrite/auth/api"; // IMPORTAR A NOVA FUNÇÃO
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

  const navigate = useNavigate();
  const location = useLocation();

  const checkAuthUser = async () => {
    setIsLoading(true);
    try {
      const currentAccount = await getCurrentUser();

      if (currentAccount) {
        // VERIFICAR E INICIALIZAR lastSeen SE NECESSÁRIO
        let userWithLastSeen = currentAccount;
        if (!currentAccount.lastSeen) {
          console.log('Inicializando lastSeen para usuário:', currentAccount.name);
          const initialized = await initializeUserLastSeen(currentAccount.$id);
          if (initialized) {
            userWithLastSeen = initialized;
          }
        }

        // VERIFICAR SE O USUÁRIO TEM ROLE DEFINIDA
        let userRole = userWithLastSeen.role;
        
        // FALLBACK: Se não tem role, verificar por ID (transição)
        if (!userRole) {
          userRole = await isAdminById(userWithLastSeen.$id) ? 'admin' : 'user';
        }

        setUser({
          id: userWithLastSeen.$id,
          name: userWithLastSeen.name,
          email: userWithLastSeen.email,
          username: userWithLastSeen.username || userWithLastSeen.name,
          imageUrl: userWithLastSeen.imageUrl,
          bio: userWithLastSeen.bio || "",
          role: userRole,
        });

        setIsAuthenticated(true);
        return true;
      }

      return false;
    } catch (error) {
      console.log(error);
      return false;
    } finally {
      setIsLoading(false);
      setHasInitialized(true);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
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
      
      if (!isAuth && cookieFallback && cookieFallback !== "[]") {
        localStorage.removeItem("cookieFallback");
      }
    };

    initializeAuth();
  }, []);

  // HOOKS DE ONLINE STATUS - SÓ EXECUTAR APÓS AUTENTICAÇÃO CONFIRMADA
  useOnlineStatus({
    updateInterval: 2,
    enableVisibilityTracking: true,
    enableBeforeUnload: true
  });

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