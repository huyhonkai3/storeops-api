import bcrypt from "bcryptjs";
import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";
const SALT_ROUNDS = 10;
export const register = async (input) => {
    const existingUser = await prisma.user.findUnique({
        where: {
            email: input.email,
        },
    });
    if (existingUser) {
        throw new AppError(409, "EMAIL_ALREADY_EXISTS", "Email already exists");
    }
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await prisma.user.create({
        data: {
            name: input.name,
            email: input.email,
            passwordHash,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return user;
};
