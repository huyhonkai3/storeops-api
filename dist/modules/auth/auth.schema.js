import { z } from "zod";
export const registerSchema = z
    .object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be at most 100 characters"),
    email: z
        .string()
        .trim()
        .email("Invalid email address")
        .transform((email) => email.toLowerCase()),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .refine((password) => Buffer.byteLength(password, "utf8") <= 72, "Password must be at most 72 bytes"),
})
    .strict();
