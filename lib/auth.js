import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'football_super_secret_jwt_key_2026_luxury_bw';

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function getUserFromReq(req) {
  try {
    let token = null;

    // Check Authorization header
    const authHeader = req.headers?.authorization || req.headers?.get?.('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // Check cookies
    if (!token) {
      const cookieHeader = req.headers?.cookie || req.headers?.get?.('cookie');
      if (cookieHeader) {
        const cookies = parse(cookieHeader);
        token = cookies.token || cookies.authToken;
      }
    }

    if (!token) return null;
    return verifyToken(token);
  } catch (e) {
    return null;
  }
}
