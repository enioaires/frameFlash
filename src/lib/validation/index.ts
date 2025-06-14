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
  audioFile: z.custom<File[]>().optional(), // NOVO: campo opcional para áudio
  adventures: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).min(1, { message: "Selecione pelo menos uma tag" }),
}).refine((data) => {
  // Validar formato de áudio se fornecido
  if (data.audioFile && data.audioFile.length > 0) {
    const audioFile = data.audioFile[0];
    const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/mpeg'];
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (!allowedTypes.includes(audioFile.type)) {
      return false;
    }
    
    if (audioFile.size > maxSize) {
      return false;
    }
  }
  
  return true;
}, {
  message: "Arquivo de áudio inválido. Use MP3, WAV, OGG ou M4A (máx. 50MB)",
  path: ["audioFile"]
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
  status: z.enum(['active', 'inactive'], {
    required_error: "Status é obrigatório",
    invalid_type_error: "Status deve ser ativo ou inativo"
  }),
  isPublic: z.boolean({
    required_error: "Visibilidade é obrigatória",
    invalid_type_error: "Visibilidade deve ser verdadeiro ou falso"
  }),
});

export const UpdateAdventureSchema = z.object({
  title: z.string().min(3, { message: "Título deve ter pelo menos 3 caracteres" }).max(100, { message: "Título deve ter no máximo 100 caracteres" }),
  description: z.string().max(1000, { message: "Descrição deve ter no máximo 1000 caracteres" }).optional(),
  file: z.custom<File[]>(),
  status: z.enum(['active', 'inactive'], {
    required_error: "Status é obrigatório",
    invalid_type_error: "Status deve ser ativo ou inativo"
  }),
  isPublic: z.boolean({
    required_error: "Visibilidade é obrigatória",
    invalid_type_error: "Visibilidade deve ser verdadeiro ou falso"
  }),
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