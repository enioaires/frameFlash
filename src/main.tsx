import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Analytics } from '@vercel/analytics/react';
import App from "./App";
import AuthProvider from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";
import { SpeedInsights } from '@vercel/speed-insights/react';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Analytics />
        <SpeedInsights />
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);
