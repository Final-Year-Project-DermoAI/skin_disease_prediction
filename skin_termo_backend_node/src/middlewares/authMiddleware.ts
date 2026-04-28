import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key';

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('Auth Failure: No token provided');
    return res.status(401).json({ detail: 'Not authenticated' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string, role: string };
    const user = await User.findOne({ where: { email: payload.sub } });
    
    if (!user) {
      console.log(`Auth Failure: User not found for email ${payload.sub}`);
      return res.status(401).json({ detail: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (err: any) {
    console.log(`Auth Failure: ${err.message}`);
    return res.status(401).json({ detail: 'Invalid token' });
  }
};
