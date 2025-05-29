/* eslint-disable react-refresh/only-export-components */

import { IContextType, IUser } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";

import { getCurrentUser } from "@/lib/appwrite/auth/api";
import { isAdminById } from "@/lib/adventures";
import { useNavigate } from "react-router-dom";

// IMPORTAÇÃO PARA VERIFICAÇÃO DE ADMIN


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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const navigate = useNavigate();

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
    }
  };

  useEffect(() => {
    const cookieFallback = localStorage.getItem("cookieFallback");
    if (
      cookieFallback === "[]" ||
      cookieFallback === null ||
      cookieFallback === undefined
    ) {
      navigate("/sign-in");
    }

    checkAuthUser();
  }, []);

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