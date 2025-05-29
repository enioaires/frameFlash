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
  captions: z.string().min(1, { message: "A legenda é obrigatória" }),
  file: z.custom<File[]>(),
  adventures: z.array(z.string()).min(1, { message: "Selecione pelo menos uma aventura" }),
  tags: z.array(z.string()).min(1, { message: "Selecione pelo menos uma tag" }),
});

export const ProfileSchema = z.object({
  file: z.custom<File[]>(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email(),
  bio: z.string(),
});

export const AdventureSchema = z.object({
  title: z.string().min(3, { message: "Título deve ter pelo menos 3 caracteres" }).max(100, { message: "Título deve ter no máximo 100 caracteres" }),
  description: z.string().max(1000, { message: "Descrição deve ter no máximo 1000 caracteres" }).optional(),
  file: z.custom<File[]>().refine((files) => files?.length > 0, "Imagem é obrigatória"),
  status: z.enum(['active', 'inactive'], { message: "Status deve ser ativo ou inativo" }),
});

export const UpdateAdventureSchema = z.object({
  title: z.string().min(3, { message: "Título deve ter pelo menos 3 caracteres" }).max(100, { message: "Título deve ter no máximo 100 caracteres" }),
  description: z.string().max(1000, { message: "Descrição deve ter no máximo 1000 caracteres" }).optional(),
  file: z.custom<File[]>(),
  status: z.enum(['active', 'inactive'], { message: "Status deve ser ativo ou inativo" }),
});

export const AdventureParticipantSchema = z.object({
  adventureId: z.string().min(1, { message: "ID da aventura é obrigatório" }),
  userId: z.string().min(1, { message: "ID do usuário é obrigatório" }),
});

// Schema para validar múltiplos participantes de uma vez
export const MultipleParticipantsSchema = z.object({
  adventureId: z.string().min(1, { message: "ID da aventura é obrigatório" }),
  userIds: z.array(z.string()).min(1, { message: "Selecione pelo menos um usuário" }),
});