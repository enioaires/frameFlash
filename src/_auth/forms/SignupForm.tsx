import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Link, useNavigate } from "react-router-dom";
import { useCreateUserAccount, useSignInAccount } from "@/lib/react-query/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loader from "@/components/shared/Loader";
import { SignupSchema } from "@/lib/validation";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";

const SignupForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { checkAuthUser, isAuthenticated } = useUserContext();

  const { mutateAsync: createUserAccount, isPending: isCreatingUser } =
    useCreateUserAccount();

  const { mutateAsync: signInAccount } = useSignInAccount();

  const form = useForm<z.infer<typeof SignupSchema>>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof SignupSchema>) {
    try {
      const newUser = await createUserAccount(values);

      if (!newUser) {
        return toast({
          title: "Erro ao criar conta",
          description:
            "Não foi possível criar sua conta, tente novamente mais tarde.",
        });
      }

      // Se já há um usuário logado (admin criando conta), não fazer login automático
      if (isAuthenticated) {
        toast({
          title: "Conta criada com sucesso!",
          description: `A conta para ${values.name} foi criada com sucesso.`,
        });
        form.reset();
        return;
      }

      // Se não há usuário logado, fazer login automático
      const session = await signInAccount({
        email: values.email,
        password: values.password,
      });

      if (!session) {
        return toast({
          title: "Conta criada, mas erro ao entrar",
          description:
            "Sua conta foi criada, mas não foi possível fazer login automático. Tente entrar manualmente.",
        });
      }

      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        form.reset();
        toast({
          title: "Bem-vindo(a)!",
          description: "Sua conta foi criada e você está logado.",
        });
        navigate("/");
      } else {
        return toast({
          title: "Erro ao entrar",
          description:
            "Sua conta foi criada, mas não foi possível fazer login. Tente entrar manualmente.",
        });
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Ocorreu um erro inesperado ao criar a conta.",
      });
    }
  }

  return (
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">
        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">
          {isAuthenticated ? "Criar nova conta" : "Crie sua conta"}
        </h2>
        <p className="text-light-3 small-medium md:base-regular mt-2">
          {isAuthenticated 
            ? "Preencha os dados para criar uma conta para outro usuário."
            : "Para entrar na plataforma, digite suas credenciais."
          }
        </p>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-col flex gap-5 w-full mt-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apelido</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          <Button type="submit" className="shad-button_primary" disabled={isCreatingUser}>
            {isCreatingUser ? (
              <div className="flex-center">
                <Loader />
              </div>
            ) : (
              isAuthenticated ? "Criar conta" : "Criar conta e entrar"
            )}
          </Button>

          {!isAuthenticated && (
            <p className="text-small-regular text-light-2 text-center mt-2">
              Já possui uma conta?{" "}
              <Link
                to="/sign-in"
                className="text-primary-500 text-small-semibold ml-1"
              >
                Entrar
              </Link>
            </p>
          )}

          {isAuthenticated && (
            <div className="text-center mt-2">
              <Link
                to="/"
                className="text-primary-500 text-small-semibold hover:text-primary-400 transition-colors"
              >
                ← Voltar ao início
              </Link>
            </div>
          )}
        </form>
      </div>
    </Form>
  );
};

export default SignupForm;