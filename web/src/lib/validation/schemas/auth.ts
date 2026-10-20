import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z
  .object({
    username: z.string().min(1, "Username cannot be empty").optional(),
    bio: z.string().nullable().optional(),
    stellar_address: z.string().nullable().optional(),
    github_url: z.string().url("Invalid GitHub URL").nullable().optional(),
    twitter_url: z.string().url("Invalid Twitter URL").nullable().optional(),
    discord_username: z.string().nullable().optional(),
    telegram_url: z.string().url("Invalid Telegram URL").nullable().optional(),
    website_url: z.string().url("Invalid website URL").nullable().optional(),
  })
  .refine(
    (body) =>
      Object.keys(body).some(
        (key) => body[key as keyof typeof body] !== undefined,
      ),
    { message: "No fields to update", path: ["body"] },
  );

export const walletAuthSchema = z.object({
  publicKey: z.string().min(1, "publicKey is required"),
  signedXrr: z.string().min(1, "signedXrr is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "refreshToken is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type WalletAuthInput = z.infer<typeof walletAuthSchema>
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
