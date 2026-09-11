import { z } from 'zod';
import { CampaignStatus, UserRole } from '../types';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().trim().email('Invalid email address').max(100, 'Email cannot exceed 100 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password cannot exceed 100 characters'),
  role: z.enum(['DONOR', 'NGO', 'AUDITOR', 'ADMIN'] as const).default('NGO'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createCampaignSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description cannot exceed 5000 characters'),
  target_amount: z.coerce
    .number()
    .positive('Target amount must be strictly greater than 0')
    .max(1000000000, 'Target amount exceeds maximum limit'),
  beneficiary: z
    .string()
    .trim()
    .min(2, 'Beneficiary must be at least 2 characters')
    .max(200, 'Beneficiary cannot exceed 200 characters'),
  status: z
    .enum(['DRAFT', 'ACTIVE'] as const)
    .default('DRAFT'),
});

export const updateCampaignSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .optional(),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description cannot exceed 5000 characters')
    .optional(),
  target_amount: z.coerce
    .number()
    .positive('Target amount must be strictly greater than 0')
    .max(1000000000, 'Target amount exceeds maximum limit')
    .optional(),
  beneficiary: z
    .string()
    .trim()
    .min(2, 'Beneficiary must be at least 2 characters')
    .max(200, 'Beneficiary cannot exceed 200 characters')
    .optional(),
});

export const changeStatusSchema = z.object({
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'] as const),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;
