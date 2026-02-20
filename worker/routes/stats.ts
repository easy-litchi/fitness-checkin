import { Hono } from 'hono';
import type { Env } from '../types';
import { authMiddleware } from '../middleware/auth';

const stats = new Hono<{ Bindings: Env; Variables: { userId: number } }>();
stats.use('*', authMiddleware);

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function dateDiffInDays(a: string, b: string): number {
  return Math.round((new Date(`${a}T00:00:00Z`).getTime() - new Date(`${b}T00:00:00Z`).getTime()) / 86400000);
}

function getDaysInMonth(year: number, monthOneBased: number): number {
  return new Date(Date.UTC(year, monthOneBased, 0)).getUTCDate();
}

stats.get('/summary', async (c) => {
  const userId = c.get('userId');
  const today = getTodayDateString();
  const currentMonth = today.slice(0, 7);

  const { results: rows } = await c.env.DB.prepare(
    'SELECT check_in_date FROM check_ins WHERE user_id = ? ORDER BY check_in_date ASC'
  ).bind(userId).all<{ check_in_date: string }>();

  const dates = rows.map(r => r.check_in_date);
  const dateSet = new Set(dates);

  let bestStreak = 0, running = 0;
  for (let i = 0; i < dates.length; i++) {
    running = (i === 0 || dateDiffInDays(dates[i], dates[i - 1]) !== 1) ? 1 : running + 1;
    if (running > bestStreak) bestStreak = running;
  }

  let currentStreak = 0, cursor = today;
  while (dateSet.has(cursor)) {
    currentStreak++;
    const d = new Date(`${cursor}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 1);
    cursor = d.toISOString().slice(0, 10);
  }

  const monthlyCountRow = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM check_ins WHERE user_id = ? AND substr(check_in_date, 1, 7) = ?"
  ).bind(userId, currentMonth).first<{ count: number }>();

  const [year, month] = currentMonth.split('-').map(Number);
  const daysInMonth = getDaysInMonth(year, month);
  const monthlyCount = monthlyCountRow?.count ?? 0;
  const completionRate = Number(((monthlyCount / daysInMonth) * 100).toFixed(1));

  return c.json({ currentStreak, bestStreak, monthlyCount, completionRate });
});

stats.get('/trend', async (c) => {
  const userId = c.get('userId');
  const months = Math.min(Math.max(Number(c.req.query('months')) || 6, 1), 24);

  const now = new Date();
  const monthKeys: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    monthKeys.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
  }

  const { results: rows } = await c.env.DB.prepare(
    `SELECT substr(check_in_date, 1, 7) as month, COUNT(*) as count
     FROM check_ins WHERE user_id = ? AND substr(check_in_date, 1, 7) >= ? AND substr(check_in_date, 1, 7) <= ?
     GROUP BY month ORDER BY month ASC`
  ).bind(userId, monthKeys[0], monthKeys[monthKeys.length - 1]).all<{ month: string; count: number }>();

  const countMap = new Map(rows.map(r => [r.month, r.count]));
  return c.json(monthKeys.map(month => ({ month, count: countMap.get(month) ?? 0 })));
});

export default stats;
