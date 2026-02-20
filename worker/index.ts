import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import auth from './routes/auth';
import checkins from './routes/checkins';
import stats from './routes/stats';

const app = new Hono<{ Bindings: Env }>();

app.use('/api/*', cors());

app.get('/api/health', (c) => c.json({ ok: true }));
app.route('/api/auth', auth);
app.route('/api/checkins', checkins);
app.route('/api/stats', stats);

app.all('*', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = '/index.html';
  return c.env.ASSETS.fetch(new Request(url));
});

export default app;
