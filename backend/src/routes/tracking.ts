import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { asyncHandler, HttpError } from '../middleware/errors';
import { localDate } from '../dates';

const r = Router();
r.use(requireAuth);

const DAY_MS = 86_400_000;
const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD');
const timeStr = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'time must be HH:MM');

function parseId(raw: string) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(400, 'Invalid id');
  return id;
}

/** Returns the 7-day window ending at ?date= (default: today). */
function weekWindow(query: unknown) {
  const end = localDate(typeof query === 'string' && query ? query : undefined);
  return { gte: new Date(end.getTime() - 6 * DAY_MS), lte: end };
}

// ---- Weight ----
r.get('/weight', asyncHandler(async (req, res) => {
  const rows = await prisma.weightLog.findMany({
    where: { userId: req.userId! },
    orderBy: { date: 'desc' },
    take: 30,
  });
  res.json(rows.reverse()); // latest 30 entries, oldest first
}));

r.post('/weight', asyncHandler(async (req, res) => {
  const v = z.object({ date: dateStr, weightKg: z.number().min(20).max(400) }).parse(req.body);
  const date = localDate(v.date);
  res.json(await prisma.weightLog.upsert({
    where: { userId_date: { userId: req.userId!, date } },
    create: { userId: req.userId!, date, weightKg: v.weightKg },
    update: { weightKg: v.weightKg },
  }));
}));

// ---- Water ----
r.get('/water', asyncHandler(async (req, res) => {
  res.json(await prisma.waterLog.findMany({
    where: { userId: req.userId!, date: weekWindow(req.query.date) },
    orderBy: { date: 'asc' },
  }));
}));

r.post('/water', asyncHandler(async (req, res) => {
  const v = z.object({ date: dateStr, glasses: z.number().int().min(0).max(30) }).parse(req.body);
  const date = localDate(v.date);
  res.json(await prisma.waterLog.upsert({
    where: { userId_date: { userId: req.userId!, date } },
    create: { userId: req.userId!, date, glasses: v.glasses },
    update: { glasses: v.glasses },
  }));
}));

// ---- Sleep ----
r.get('/sleep', asyncHandler(async (req, res) => {
  res.json(await prisma.sleepLog.findMany({
    where: { userId: req.userId!, date: weekWindow(req.query.date) },
    orderBy: { date: 'asc' },
  }));
}));

r.post('/sleep', asyncHandler(async (req, res) => {
  const v = z.object({ date: dateStr, hours: z.number().min(0).max(24) }).parse(req.body);
  const date = localDate(v.date);
  res.json(await prisma.sleepLog.upsert({
    where: { userId_date: { userId: req.userId!, date } },
    create: { userId: req.userId!, date, hours: v.hours },
    update: { hours: v.hours },
  }));
}));

// ---- Reminders ----
const reminderBody = z.object({
  type: z.string().min(2).default('general'),
  label: z.string().min(2).max(100),
  time: timeStr,
  enabled: z.boolean().default(true),
});

r.get('/reminders', asyncHandler(async (req, res) => {
  res.json(await prisma.reminder.findMany({ where: { userId: req.userId! }, orderBy: { time: 'asc' } }));
}));

r.post('/reminders', asyncHandler(async (req, res) => {
  const v = reminderBody.parse(req.body);
  res.status(201).json(await prisma.reminder.create({ data: { userId: req.userId!, ...v } }));
}));

r.put('/reminders/:id', asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const v = reminderBody.parse(req.body);
  const result = await prisma.reminder.updateMany({ where: { id, userId: req.userId! }, data: v });
  if (result.count === 0) throw new HttpError(404, 'Reminder not found');
  res.json(await prisma.reminder.findUnique({ where: { id } }));
}));

r.delete('/reminders/:id', asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  await prisma.reminder.deleteMany({ where: { id, userId: req.userId! } });
  res.status(204).end();
}));

export default r;
