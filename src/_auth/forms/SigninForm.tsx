import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loader from "@/components/shared/Loader";
import { SigninSchema } from "@/lib/validation";
import { account } from "@/lib/appwrite/config";
import { useForm } from "react-hook-form";
import { useSignInAccount } from "@/lib/react-query/auth";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";

const SigninForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuthUser, isLoading: isContextLoading } = useUserContext();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const { mutateAsync: signInAccount } = useSignInAccount();

  const form = useForm<z.infer<typeof SigninSchema>>({
    resolver: zodResolver(SigninSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Função para limpar sessões antigas de forma segura
  const clearExistingSessions = async () => {
    try {
      // Múltiplas tentativas de limpeza
      const cleanupPromises = [
        // Tentar deletar sessão atual
        account.deleteSession('current').catch(() => null),
        // Limpar storage local
        Promise.resolve().then(() => {
          try {
            localStorage.removeItem("cookieFallback");
          } catch (e) {
            // Ignorar
          }
        })
      ];

      await Promise.allSettled(cleanupPromises);
    } catch (error) {
      // Falhar silenciosamente na limpeza
    }
  };

  async function onSubmit(values: z.infer<typeof SigninSchema>) {
    if (isSigningIn) return; // Evitar submissões duplas
    
    setIsSigningIn(true);

    try {
      // Limpar sessões existentes primeiro
      await clearExistingSessions();

      // Pequeno delay para garantir limpeza
      await new Promise(resolve => setTimeout(resolve, 100));

      const session = await signInAccount({
        email: values.email,
        password: values.password,
      });

      if (!session) {
        throw new Error("Failed to create session");
      }

      // Verificar autenticação
      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        form.reset();
        
        // Atualizar cookie de fallback
        localStorage.setItem("cookieFallback", JSON.stringify(session));
        
        const from = (location.state as any)?.from?.pathname || "/";
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta!",
        });

        // Pequeno delay antes de navegar para garantir que o estado foi atualizado
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 100);
      } else {
        throw new Error("Authentication verification failed");
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      let message = "Ocorreu um erro inesperado.";
      
      if (error.message?.includes("Invalid credentials") || 
          error.code === 401 || 
          error.type === 'user_invalid_credentials') {
        message = "Email ou senha incorretos.";
      } else if (error.message?.includes("network") || error.name === "NetworkError") {
        message = "Erro de conexão. Verifique sua internet.";
      } else if (error.message?.includes("rate")) {
        message = "Muitas tentativas. Aguarde um momento.";
      }
      
      toast({
        title: "Erro ao entrar",
        description: message,
      });

      // Limpar campos de senha em caso de erro
      form.setValue("password", "");
    } finally {
      setIsSigningIn(false);
    }
  }

  const isLoading = isSigningIn || isContextLoading;

  return (
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">
        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Entre em sua conta</h2>
        <p className="text-light-3 small-medium md:base-regular mt-2">
          Para entrar, digite suas credenciais.
        </p>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-col flex gap-5 w-full mt-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    className="shad-input" 
                    disabled={isLoading}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    className="shad-input" 
                    disabled={isLoading}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="shad-button_primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex-center gap-2">
                <Loader size="sm" />
                <span>Entrando...</span>
              </div>
            ) : (
              "Entrar"
            )}
          </Button>
          
          <p className="text-small-regular text-light-2 text-center mt-2">
            Não possui uma conta?{" "}
            <Link
              to="/sign-up"
              className="text-primary-500 text-small-semibold ml-1 hover:text-primary-400 transition-colors"
            >
              Registre-se
            </Link>
          </p>
        </form>
      </div>
    </Form>
  );
};

export default SigninForm;