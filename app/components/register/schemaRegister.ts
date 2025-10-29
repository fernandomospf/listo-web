import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres'),

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