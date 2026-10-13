import { z } from 'zod';

export const passwordSchema = z.string().min(10, 'At least 10 characters').max(128, 'At most 128 characters')
  .regex(/[A-Z]/, 'Include an uppercase letter').regex(/[a-z]/, 'Include a lowercase letter')
  .regex(/[0-9]/, 'Include a number').regex(/[^A-Za-z0-9]/, 'Include a symbol');

const profilePic = z.string().trim().max(2048).optional().default('')
  .refine((v) => {
    if (!v) return true;
    const l = v.toLowerCase();
    if (l.startsWith('javascript:') || l.startsWith('data:') || l.startsWith('file:')) return false;
    try { return new URL(v).protocol === 'https:'; } catch { return false; }
  }, 'Must be a valid HTTPS URL');

export const signupSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName: z.string().trim().min(1, 'Last name is required').max(50),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  mobileNumber: z.string().trim().min(4, 'Enter a valid phone number').max(20),
  username: z.string().trim().min(3, 'At least 3 characters').max(30).regex(/^[a-zA-Z0-9_.]+$/, 'Letters, numbers, dots, underscores'),
  profilePicUrl: profilePic,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Confirm your password'),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
}).refine((d) => d.password === d.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName: z.string().trim().min(1, 'Last name is required').max(50),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address').max(254),
  mobileNumber: z.string().trim().min(4, 'Enter a valid phone number').max(20),
  profilePicUrl: profilePic,
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password').max(128),
  newPassword: passwordSchema,
  confirmNewPassword: z.string().min(1, 'Confirm your new password'),
}).refine((d) => d.newPassword === d.confirmNewPassword, { path: ['confirmNewPassword'], message: 'Passwords do not match' });

export type ProfileInput = z.infer<typeof profileSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Enter your email, username, or mobile number').max(254),
  password: z.string().min(1, 'Password is required').max(128),
  rememberMe: z.boolean().optional().default(false),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, 'Enter your registered email address').email('Enter a valid email address').max(254),
});

export const verifyOtpSchema = z.object({
  otp: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});

export const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
  confirmNewPassword: z.string().min(1, 'Confirm your new password'),
}).refine((d) => d.newPassword === d.confirmNewPassword, { path: ['confirmNewPassword'], message: 'Passwords do not match' });

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
