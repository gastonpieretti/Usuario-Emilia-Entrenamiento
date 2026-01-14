import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
// LLAVE MAESTRA SINCRONIZADA
const JWT_SECRET = process.env.JWT_SECRET || 'EMILIA_SECRET_KEY_2026';

export const register = async (userData: any) => {
  const { email, password, name, lastName } = userData;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('El correo electrónico ya está registrado.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      name,
      lastName,
      role: 'client',
      planType: 'COMPLETO',
    },
  });

  // Guardamos como 'id' para coincidir con el middleware
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  const { passwordHash: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Credenciales inválidas.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Credenciales inválidas.');
  }

  // Guardamos como 'id' para coincidir con el middleware
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  const { passwordHash: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};
