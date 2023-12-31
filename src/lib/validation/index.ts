import * as z from "zod";

export const SignupSchema = z.object({
  username: z.string().min(2, { message: 'Username precisa de pelo menos 2 caracteres' }).max(50),
  name: z.string().min(2, { message: 'Nome precisa de pelo menos 2 caracteres' }).max(50),
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(8, { message: 'Senha precisa ter pelo menos 8 caracteres' }).max(50),
});

export const SigninSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(8, { message: 'Senha precisa ter pelo menos 8 caracteres' }).max(50),
});

export const PostSchema = z.object({
  title: z.string().min(5).max(100),
  captions: z.array(z.string()),
  file: z.custom<File[]>(),
  location: z.string().min(5).max(100),
  tags: z.string(),
});

export const ProfileSchema = z.object({
  file: z.custom<File[]>(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email(),
  bio: z.string(),
});