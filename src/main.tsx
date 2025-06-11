import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Analytics } from '@vercel/analytics/react';
import App from "./App";
import AuthProvider from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "./components/shared/ErrorBoundery";
import ReactDOM from "react-dom/client";
import { SpeedInsights } from '@vercel/speed-insights/react';
import { initializeErrorHandling } from "./lib/errorHandling";

// Inicializar tratamento de erros o mais cedo possível
initializeErrorHandling();

// Configuração otimizada do Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reduzir tentativas de retry em caso de erro
      retry: (failureCount, error: any) => {
        // Não retry para erros de extensão ou auth
        if (error?.code === 401 || 
            error?.message?.includes('Extension context') ||
            error?.message?.includes('user_session_not_found')) {
          return false;
        }
        return failureCount < 1; // Só 1 retry
      },
      // Cache mais longo para reduzir requests
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      // Desabilitar refetch em foco para evitar requests excessivos
      refetchOnWindowFocus: false,
      refetchOnMount: 'always',
      networkMode: 'online'
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Não retry para erros de auth
        if (error?.code === 401 || error?.message?.includes('user_session_not_found')) {
          return false;
        }
        return failureCount < 1;
      },
      networkMode: 'online'
    }
  }
});

// Suprimir logs de desenvolvimento do React Query em produção
if (process.env.NODE_ENV === 'production') {
  queryClient.setQueryDefaults(['auth'], {
    retry: false,
    refetchOnWindowFocus: false
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
          <Analytics />
          <SpeedInsights />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </ErrorBoundary>
);