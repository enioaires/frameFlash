import * as z from "zod";

export const SignupSchema = z.object({
  username: z.string().min(2, { message: 'Username precisa de pelo menos 2 caracteres' }).max(50),
  name: z.string().min(2, { message: 'Nome precisa de pelo menos 2 caracteres' }).max(50),
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(8, { message: 'Senha precisa ter pelo menos 6 caracteres' }).max(50),
});

export const SigninSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(8, { message: 'Senha precisa ter pelo menos 6 caracteres' }).max(50),
});

export const PostSchema = z.object({
  caption: z.string().min(5).max(200),
  file: z.custom<File[]>(),
  location: z.string().min(5).max(100),
  tags: z.string(),
});