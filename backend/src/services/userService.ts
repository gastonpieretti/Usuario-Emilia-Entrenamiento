import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUserById = async (userId: number) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true }
  });
};

export const getUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({ where: { email } });
};

export const createUser = async (data: any) => {
  return await prisma.user.create({
    data: {
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.name,
      lastName: data.lastName,
      role: 'client' // <--- CORREGIDO A MINÚSCULA
    }
  });
};

export const updateUser = async (userId: number, data: any) => {
  return await prisma.user.update({ where: { id: userId }, data });
};
