import { createMiddleware } from 'hono/factory';
import type { Env } from '../types';
import { verifyToken } from '../lib/jwt';

export const authMiddleware = createMiddleware<{ Bindings: Env; Variables: { userId: number } }>(async (c, next) => {
  const header = c.req.header('authorization');
  if (!header) return c.json({ message: 'Missing Authorization header.' }, 401);

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return c.json({ message: 'Invalid Authorization header format.' }, 401);

  try {
    const { userId } = await verifyToken(token, c.env.JWT_SECRET);
    c.set('userId', userId);
    await next();
  } catch {
    return c.json({ message: 'Invalid or expired token.' }, 401);
  }
});
