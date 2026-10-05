import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db';
import { signToken, requireAuth } from '../middleware/auth';
import { asyncHandler, HttpError } from '../middleware/errors';
import { usersRegistered, loginAttempts } from '../metrics';

const r = Router();
const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

r.post('/register', asyncHandler(async (req, res) => {
  const v = credentials.parse(req.body);
  const email = v.email.toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) {
    throw new HttpError(409, 'Email already registered');
  }
  const user = await prisma.user.create({
    data: { email, passwordHash: await bcrypt.hash(v.password, 10) },
  });
  usersRegistered.inc();
  res.status(201).json({ token: signToken(user.id), user: { id: user.id, email: user.email }, onboarded: false });
}));

r.post('/login', asyncHandler(async (req, res) => {
  const v = credentials.parse(req.body);
  const u = await prisma.user.findUnique({
    where: { email: v.email.toLowerCase() },
    include: { profile: true },
  });
  if (!u || !(await bcrypt.compare(v.password, u.passwordHash))) {
    loginAttempts.inc({ result: 'failure' });
    throw new HttpError(401, 'Invalid email or password');
  }
  loginAttempts.inc({ result: 'success' });
  res.json({ token: signToken(u.id), user: { id: u.id, email: u.email }, onboarded: !!u.profile });
}));

r.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const u = await prisma.user.findUnique({ where: { id: req.userId! }, include: { profile: true } });
  if (!u) throw new HttpError(404, 'User not found');
  res.json({ user: { id: u.id, email: u.email }, profile: u.profile, onboarded: !!u.profile });
}));

export default r;
