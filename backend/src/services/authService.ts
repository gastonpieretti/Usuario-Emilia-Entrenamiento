import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Usuario no encontrado');

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new Error('Contraseña incorrecta');

  const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  return { user, token };
};

export const register = async (data: any) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error('El email ya está registrado');

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash: hashedPassword,
      name: data.name,
      lastName: data.lastName,
      role: 'CLIENT'
    }
  });
  return user;
};
