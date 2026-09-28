import { z } from "zod";

const phonePattern = /^\+[1-9]\d{7,14}$/;

export const normalizePhone = (value: string) => {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  return digits ? `+${digits}` : "";
};

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your email or phone number.").max(255),
  password: z.string().min(1, "Enter your password.").max(128),
});

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name.").max(100),
    email: z.string().trim().email("Enter a valid email address.").max(255),
    phone: z.string().transform(normalizePhone).pipe(
      z.string().regex(phonePattern, "Use an international phone number, for example +919876543210."),
    ),
    password: z
      .string()
      .min(6, "Use at least 6 characters.")
      .max(128)
      .regex(/[A-Z]/, "Include an uppercase letter.")
      .regex(/[a-z]/, "Include a lowercase letter.")
      .regex(/[0-9]/, "Include a number."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type AppRole = "student" | "admin";
