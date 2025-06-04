/* eslint-disable react-refresh/only-export-components */

import { IContextType, IUser } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { getCurrentUser } from "@/lib/appwrite/auth/api";
import { isAdminById } from "@/lib/adventures";
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export const INITIAL_USER = {
  id: "",
  name: "",
  email: "",
  username: "",
  imageUrl: "",
  bio: "",
  role: "user" as "admin" | "user", // CAMPO ROLE ADICIONADO
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
  const [isLoading, setIsLoading] = useState<boolean>(true); // Começa como true
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false); // Novo estado

  const navigate = useNavigate();
  const location = useLocation();

  const checkAuthUser = async () => {
    setIsLoading(true);
    try {
      const currentAccount = await getCurrentUser();

      if (currentAccount) {
        // VERIFICAR SE O USUÁRIO TEM ROLE DEFINIDA
        let userRole = currentAccount.role;
        
        // FALLBACK: Se não tem role, verificar por ID (transição)
        if (!userRole) {
          userRole = await isAdminById(currentAccount.$id) ? 'admin' : 'user';
        }

        setUser({
          id: currentAccount.$id,
          name: currentAccount.name,
          email: currentAccount.email,
          username: currentAccount.username || currentAccount.name,
          imageUrl: currentAccount.imageUrl,
          bio: currentAccount.bio || "",
          role: userRole, // DEFINIR ROLE
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
      setHasInitialized(true); // Marca como inicializado
    }
  };

  useEffect(() => {
    // Verificar autenticação na inicialização
    const initializeAuth = async () => {
      const cookieFallback = localStorage.getItem("cookieFallback");
      
      // Se não tem cookie de sessão, não está autenticado
      if (
        cookieFallback === "[]" ||
        cookieFallback === null ||
        cookieFallback === undefined
      ) {
        setIsLoading(false);
        setHasInitialized(true);
        return;
      }

      // Verificar autenticação
      const isAuth = await checkAuthUser();
      
      // Se não conseguiu autenticar com cookie válido, limpar e redirecionar
      if (!isAuth && cookieFallback && cookieFallback !== "[]") {
        localStorage.removeItem("cookieFallback");
        // REMOVIDO: navigate("/sign-in"); // Não forçar redirecionamento aqui
      }
    };

    initializeAuth();
  }, []); // Remove navigate das dependências para evitar loops

  useOnlineStatus({
    updateInterval: 2, // 2 minutos
    enableVisibilityTracking: true,
    enableBeforeUnload: true
  });

  // MODIFICADO: Só navegar para sign-in se não estiver em rota de auth
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

// HOOKS AUXILIARES PARA VERIFICAÇÃO DE PERMISSÕES
export const useIsAdmin = () => {
  const { user } = useUserContext();
  return user.role === 'admin';
};

export const useCanAccessAdminFeatures = () => {
  const { user } = useUserContext();
  // Verificação dupla: por role e por ID (durante transição)
  return user.role === 'admin' || isAdminById(user.id);
};