import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret_emilia_2024';

// --- FUNCIÓN DE REGISTRO ---
export const register = async (userData: any) => {
  const { email, password, name, lastName } = userData;

  // 1. Verificar si el usuario ya existe
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('El correo electrónico ya está registrado.');
  }

  // 2. Cifrar la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Crear el usuario en la base de datos (Usando passwordHash según tu schema)
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      name,
      lastName,
      role: 'client', // Por defecto es cliente
      planType: 'COMPLETO', // Valor por defecto del schema
    },
  });

  // 4. Generar token para login automático tras registro
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  // No devolvemos el passwordHash por seguridad
  const { passwordHash: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

// --- FUNCIÓN DE LOGIN (BOTÓN INGRESAR) ---
export const login = async (email: string, password: string) => {
  // 1. Buscar el usuario
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Credenciales inválidas.');
  }

  // 2. Comparar la contraseña ingresada con la cifrada en la DB
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Credenciales inválidas.');
  }

  // 3. Generar token de sesión
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  const { passwordHash: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};
