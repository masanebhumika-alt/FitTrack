import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/db';

// Integration tests: need a reachable PostgreSQL (DATABASE_URL) with migrations applied.
const email = `test-${Date.now()}@fittrack.test`;
const password = 'secret123';
let token = '';
const auth = () => ({ Authorization: `Bearer ${token}` });
const today = new Date().toLocaleDateString('en-CA');

const profile = {
  name: 'Test User',
  age: 25,
  gender: 'male',
  heightCm: 175,
  weightKg: 70,
  targetWeightKg: 65,
  activityLevel: 'moderate',
};

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: '@fittrack.test' } } });
  await prisma.$disconnect();
});

describe('health & monitoring', () => {
  it('GET /health reports database ok', async () => {
    const r = await request(app).get('/health');
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ status: 'ok', database: 'ok' });
  });

  it('GET /api/metrics is public and exposes Prometheus metrics', async () => {
    const r = await request(app).get('/api/metrics');
    expect(r.status).toBe(200);
    expect(r.text).toContain('fittrack_http_requests_total');
    expect(r.text).toContain('process_cpu_user_seconds_total');
  });
});

describe('authentication', () => {
  it('rejects invalid input with 400', async () => {
    const r = await request(app).post('/api/auth/register').send({ email: 'not-an-email', password: '1' });
    expect(r.status).toBe(400);
  });

  it('registers a new user', async () => {
    const r = await request(app).post('/api/auth/register').send({ email, password });
    expect(r.status).toBe(201);
    expect(r.body.token).toBeTruthy();
    expect(r.body.onboarded).toBe(false);
  });

  it('rejects a duplicate email with 409', async () => {
    const r = await request(app).post('/api/auth/register').send({ email, password });
    expect(r.status).toBe(409);
  });

  it('rejects a wrong password with 401', async () => {
    const r = await request(app).post('/api/auth/login').send({ email, password: 'wrong-password' });
    expect(r.status).toBe(401);
  });

  it('logs in with the right password', async () => {
    const r = await request(app).post('/api/auth/login').send({ email, password });
    expect(r.status).toBe(200);
    token = r.body.token;
    expect(token).toBeTruthy();
  });

  it('blocks protected routes without a token', async () => {
    expect((await request(app).get('/api/dashboard')).status).toBe(401);
    expect((await request(app).get('/api/weight')).status).toBe(401);
  });
});

describe('profile and plans', () => {
  it('cannot generate a plan before saving a profile', async () => {
    const r = await request(app).post('/api/profile/generate-plan').set(auth()).send({ goal: 'maintain' });
    expect(r.status).toBe(400);
  });

  it('validates profile fields', async () => {
    const r = await request(app).put('/api/profile').set(auth()).send({ ...profile, age: 5 });
    expect(r.status).toBe(400);
  });

  it('saves a profile', async () => {
    const r = await request(app).put('/api/profile').set(auth()).send(profile);
    expect(r.status).toBe(200);
    expect(r.body.name).toBe('Test User');
  });

  it('generates a plan with correct numbers', async () => {
    const r = await request(app).post('/api/profile/generate-plan').set(auth()).send({ goal: 'weight_loss' });
    expect(r.status).toBe(200);
    expect(r.body.goal).toBe('weight_loss');
    expect(r.body.bmi).toBeCloseTo(22.9, 1);
    expect(r.body.targetCalories).toBe(2094);
  });

  it('returns a 7-day workout plan and a 4-meal diet plan', async () => {
    const w = await request(app).get('/api/plans/workout').set(auth());
    const d = await request(app).get('/api/plans/diet').set(auth());
    expect(w.body).toHaveLength(7);
    expect(d.body).toHaveLength(4);
  });

  it('regenerating a plan replaces the old one', async () => {
    await request(app).post('/api/profile/generate-plan').set(auth()).send({ goal: 'muscle_building' });
    const w = await request(app).get('/api/plans/workout').set(auth());
    expect(w.body).toHaveLength(7);
    const p = await request(app).get('/api/plans').set(auth());
    expect(p.body.goal).toBe('muscle_building');
  });
});

describe('tracking', () => {
  it('stores and updates weight for a day (upsert)', async () => {
    await request(app).post('/api/weight').set(auth()).send({ date: today, weightKg: 70 });
    const r = await request(app).post('/api/weight').set(auth()).send({ date: today, weightKg: 69.5 });
    expect(r.status).toBe(200);
    const list = await request(app).get('/api/weight').set(auth());
    expect(list.body).toHaveLength(1);
    expect(list.body[0].weightKg).toBe(69.5);
  });

  it('rejects a malformed date', async () => {
    const r = await request(app).post('/api/water').set(auth()).send({ date: '05-10-2026', glasses: 3 });
    expect(r.status).toBe(400);
  });

  it('logs water and sleep', async () => {
    expect((await request(app).post('/api/water').set(auth()).send({ date: today, glasses: 6 })).status).toBe(200);
    expect((await request(app).post('/api/sleep').set(auth()).send({ date: today, hours: 7.5 })).status).toBe(200);
    const water = await request(app).get(`/api/water?date=${today}`).set(auth());
    expect(water.body.at(-1).glasses).toBe(6);
  });

  it('creates, lists, updates and deletes reminders', async () => {
    const created = await request(app).post('/api/reminders').set(auth()).send({ label: 'Drink water', time: '10:00' });
    expect(created.status).toBe(201);
    const id = created.body.id;

    const bad = await request(app).post('/api/reminders').set(auth()).send({ label: 'Bad', time: '25:99' });
    expect(bad.status).toBe(400);

    const updated = await request(app).put(`/api/reminders/${id}`).set(auth()).send({ label: 'Drink more water', time: '11:30', enabled: false });
    expect(updated.status).toBe(200);
    expect(updated.body.time).toBe('11:30');

    const del = await request(app).delete(`/api/reminders/${id}`).set(auth());
    expect(del.status).toBe(204);
    const list = await request(app).get('/api/reminders').set(auth());
    expect(list.body).toHaveLength(0);
  });

  it('dashboard aggregates profile, plan and today\'s logs', async () => {
    const r = await request(app).get('/api/dashboard').set(auth());
    expect(r.status).toBe(200);
    expect(r.body.profile.name).toBe('Test User');
    expect(r.body.plan.goal).toBe('muscle_building');
    expect(r.body.water.glasses).toBe(6);
    expect(r.body.workouts).toHaveLength(7);
  });
});
