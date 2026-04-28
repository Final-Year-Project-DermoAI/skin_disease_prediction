import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key';
const ALGORITHM = 'HS256';

export const getPasswordHash = (password: string): string => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

export const verifyPassword = (password: string, hash: string): boolean => {
  return bcrypt.compareSync(password, hash);
};

export const createAccessToken = (data: object): string => {
  return jwt.sign(data, JWT_SECRET, {
    expiresIn: '7d',
    algorithm: ALGORITHM as jwt.Algorithm,
  });
};
