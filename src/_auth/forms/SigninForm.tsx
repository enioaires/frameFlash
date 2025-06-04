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
import { account } from "@/lib/appwrite/config"; // MUDANÇA: import estático
import { useForm } from "react-hook-form";
import { useSignInAccount } from "@/lib/react-query/auth";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";

const SigninForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuthUser, isLoading } = useUserContext();

  const { mutateAsync: signInAccount, isPending: isSigningIn } =
    useSignInAccount();

  const form = useForm<z.infer<typeof SigninSchema>>({
    resolver: zodResolver(SigninSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof SigninSchema>) {
    try {
      // Limpar sessão existente se houver
      try {
        await account.deleteSession('current'); // MUDANÇA: usar import estático
      } catch (error) {
        // Ignorar erro se não houver sessão
      }

      const session = await signInAccount({
        email: values.email,
        password: values.password,
      });

      if (!session) {
        return toast({
          title: "Erro ao entrar",
          description: "Verifique suas credenciais e tente novamente.",
        });
      }

      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        form.reset();
        const from = (location.state as any)?.from?.pathname || "/";
        navigate(from, { replace: true });
      } else {
        return toast({
          title: "Erro ao entrar",
          description: "Não foi possível entrar com sua conta, tente novamente.",
        });
      }
    } catch (error: any) {
      let message = "Ocorreu um erro inesperado.";
      
      if (error.message?.includes("Invalid credentials") || error.code === 401) {
        message = "Email ou senha incorretos.";
      }
      
      toast({
        title: "Erro ao entrar",
        description: message,
      });
    }
  }

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
                  <Input type="email" className="shad-input" {...field} />
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
                  <Input type="password" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="shad-button_primary"
            disabled={isSigningIn || isLoading}
          >
            {isSigningIn || isLoading ? (
              <div className="flex-center">
                <Loader />
              </div>
            ) : (
              "Entrar"
            )}
          </Button>
          
          <p className="text-small-regular text-light-2 text-center mt-2">
            Não possui uma conta?{" "}
            <Link
              to="/sign-up"
              className="text-primary-500 text-small-semibold ml-1"
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