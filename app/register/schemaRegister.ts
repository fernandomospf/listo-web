import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string()
    .min(3, 'Username deve ter pelo menos 3 caracteres'),

  username: z.string()
    .min(3, 'Username deve ter pelo menos 3 caracteres')
    .max(20, 'Username não pode ter mais de 20 caracteres')
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Username deve começar com letra ou underscore e pode conter apenas letras, números e underscore'),
  
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório'),
  
  password: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(50, 'Senha muito longa')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'
    ),
  
  confirmPassword: z.string()
    .min(1, 'Confirmação de senha é obrigatória')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
});

export type RegisterSchema = z.infer<typeof registerSchema>;