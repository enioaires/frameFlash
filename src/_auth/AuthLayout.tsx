import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useUserContext } from "@/context/AuthContext";

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useUserContext();
  const location = useLocation();

  // Aguardar carregamento para evitar flash
  if (isLoading) {
    return (
      <div className="flex-center w-full h-screen bg-dark-1">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-primary-500/20 rounded-full mb-4"></div>
          <div className="text-light-4 text-sm">Carregando...</div>
        </div>
      </div>
    );
  }

  // MODIFICADO: Só redirecionar se estiver autenticado E tentando acessar sign-in
  // Permitir sign-up mesmo quando autenticado (para admins criarem contas)
  if (isAuthenticated && location.pathname === "/sign-in") {
    const from = (location.state as any)?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  return (
    <section className="flex flex-1 justify-center items-center flex-col py-10">
      <Outlet />
    </section>
  );
}