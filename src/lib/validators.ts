import { z } from 'zod';

// ==========================================
// Auth Schemas
// ==========================================

export const registerSchema = z.object({
    firstName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
    email: z.string().email('Некорректный email'),
    phone: z.string().optional(),
    password: z
        .string()
        .min(8, 'Пароль должен содержать минимум 8 символов')
        .regex(/[a-zA-Z]/, 'Пароль должен содержать хотя бы одну букву')
        .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру'),
});

export const loginSchema = z.object({
    email: z.string().email('Некорректный email'),
    password: z.string().min(1, 'Введите пароль'),
    remember: z.boolean().optional(),
});

export const resetPasswordSchema = z.object({
    email: z.string().email('Некорректный email'),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Введите текущий пароль'),
    newPassword: z
        .string()
        .min(8, 'Пароль должен содержать минимум 8 символов')
        .regex(/[a-zA-Z]/, 'Пароль должен содержать хотя бы одну букву')
        .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру'),
});

// ==========================================
// User Schemas
// ==========================================

export const updateProfileSchema = z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    phone: z.string().optional(),
});

// ==========================================
// Order Schemas
// ==========================================

export const createOrderSchema = z.object({
    coinsAmount: z
        .number()
        .min(30, 'Минимум 30 монет')
        .max(100000, 'Максимум 100,000 монет'),
    paymentMethod: z.enum(['card', 'yoomoney', 'sbp']),
});

export const sendCredentialsSchema = z.object({
    tiktokLogin: z.string().min(1, 'Введите логин'),
    tiktokPassword: z.string().min(1, 'Введите пароль'),
});

// ==========================================
// Review Schemas
// ==========================================

export const createReviewSchema = z.object({
    orderId: z.string().uuid(),
    rating: z.number().min(1).max(5),
    content: z.string()
        .min(10, 'Напишите хотя бы пару слов')
        .max(500, 'Слишком длинный отзыв')
        .refine(val => val.trim().split(/\s+/).length >= 5, 'Отзыв должен содержать минимум 5 слов'),
    images: z.array(z.string().url()).max(3).optional(),
});

// ==========================================
// Message Schemas
// ==========================================

export const sendMessageSchema = z.object({
    orderId: z.string().uuid(),
    content: z.string().min(1).max(1000),
});

// Types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type SendCredentialsInput = z.infer<typeof sendCredentialsSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
