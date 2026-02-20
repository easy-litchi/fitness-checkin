import { Hono } from 'hono';
import type { Env } from '../types';
import { authMiddleware } from '../middleware/auth';

const checkins = new Hono<{ Bindings: Env; Variables: { userId: number } }>();
checkins.use('*', authMiddleware);

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

checkins.post('/', async (c) => {
  const userId = c.get('userId');
  const today = getTodayDateString();
  const result = await c.env.DB.prepare(
    'INSERT INTO check_ins (user_id, check_in_date) VALUES (?, ?) ON CONFLICT(user_id, check_in_date) DO NOTHING'
  ).bind(userId, today).run();
  return c.json({ date: today, created: (result.meta.changes ?? 0) > 0 }, 201);
});

checkins.get('/', async (c) => {
  const userId = c.get('userId');
  const month = c.req.query('month');
  if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return c.json({ message: 'Invalid month query. Expected YYYY-MM.' }, 400);
  }
  const { results } = await c.env.DB.prepare(
    "SELECT check_in_date FROM check_ins WHERE user_id = ? AND substr(check_in_date, 1, 7) = ? ORDER BY check_in_date ASC"
  ).bind(userId, month).all<{ check_in_date: string }>();
  return c.json(results.map(r => r.check_in_date));
});

export default checkins;
