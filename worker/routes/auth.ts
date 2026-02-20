import { Hono } from 'hono';
import type { Env } from '../types';
import { hashPassword, verifyPassword } from '../lib/password';
import { signToken } from '../lib/jwt';
import { authMiddleware } from '../middleware/auth';

const auth = new Hono<{ Bindings: Env; Variables: { userId: number } }>();

auth.post('/register', async (c) => {
  const body = await c.req.json<{ username?: string; nickname?: string; password?: string }>();
  const username = body.username?.trim();
  const nickname = body.nickname?.trim();
  const password = body.password;

  if (!username || username.length < 2 || username.length > 32) return c.json({ message: '账号长度应为2-32位' }, 400);
  if (!nickname || nickname.length < 1 || nickname.length > 32) return c.json({ message: '昵称长度应为1-32位' }, 400);
  if (!password || password.length < 6 || password.length > 128) return c.json({ message: '密码长度应为6-128位' }, 400);

  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
  if (existing) return c.json({ message: '该账号已被注册' }, 409);

  const passwordHash = await hashPassword(password);
  const result = await c.env.DB.prepare(
    'INSERT INTO users (username, nickname, password_hash) VALUES (?, ?, ?)'
  ).bind(username, nickname, passwordHash).run();

  const user = { id: result.meta.last_row_id as number, username, nickname };
  const token = await signToken(user.id, c.env.JWT_SECRET);
  return c.json({ token, user }, 201);
});

auth.post('/login', async (c) => {
  const body = await c.req.json<{ username?: string; password?: string }>();
  const username = body.username?.trim();
  const password = body.password;

  if (!username || !password) return c.json({ message: '请填写账号和密码' }, 400);

  const row = await c.env.DB.prepare(
    'SELECT id, username, nickname, password_hash FROM users WHERE username = ?'
  ).bind(username).first<{ id: number; username: string; nickname: string; password_hash: string }>();
  if (!row) return c.json({ message: '账号或密码错误' }, 401);

  const valid = await verifyPassword(password, row.password_hash);
  if (!valid) return c.json({ message: '账号或密码错误' }, 401);

  const token = await signToken(row.id, c.env.JWT_SECRET);
  return c.json({ token, user: { id: row.id, username: row.username, nickname: row.nickname } });
});

auth.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const user = await c.env.DB.prepare(
    'SELECT id, username, nickname FROM users WHERE id = ?'
  ).bind(userId).first<{ id: number; username: string; nickname: string }>();
  if (!user) return c.json({ message: 'User not found.' }, 404);
  return c.json({ user });
});

export default auth;
