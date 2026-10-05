import { describe, it, expect } from 'vitest';
import {
  calculateBmi,
  calculateBmr,
  calculateFitnessPlan,
  recommendDifficulty,
} from '../src/services/fitness';

const person = { weightKg: 70, heightCm: 175, age: 25, gender: 'male' as const, activityLevel: 'moderate' as const };

describe('fitness calculations', () => {
  it('calculates BMI', () => expect(calculateBmi(70, 175)).toBeCloseTo(22.86, 1));

  it('calculates BMR (Mifflin-St Jeor) for a male', () =>
    expect(calculateBmr(person)).toBeCloseTo(1674, 0));

  it('calculates a lower BMR for a female of the same build', () =>
    expect(calculateBmr({ ...person, gender: 'female' })).toBeLessThan(calculateBmr(person)));

  it('builds a weight-loss plan with a 500 kcal deficit', () => {
    const p = calculateFitnessPlan(person, 'weight_loss');
    expect(p.tdee - p.targetCalories).toBeGreaterThanOrEqual(499);
    expect(p.tdee - p.targetCalories).toBeLessThanOrEqual(501);
    expect(p.proteinG).toBe(126);
  });

  it('builds a weight-gain plan with a surplus', () => {
    const p = calculateFitnessPlan(person, 'weight_gain');
    expect(p.targetCalories).toBeGreaterThan(p.tdee);
  });

  it('never goes below 1200 kcal', () => {
    const tiny = { weightKg: 40, heightCm: 150, age: 70, gender: 'female' as const, activityLevel: 'sedentary' as const };
    expect(calculateFitnessPlan(tiny, 'weight_loss').targetCalories).toBe(1200);
  });

  it('maps activity level to workout difficulty', () => {
    expect(recommendDifficulty('sedentary')).toBe('beginner');
    expect(recommendDifficulty('moderate')).toBe('intermediate');
    expect(recommendDifficulty('athlete')).toBe('advanced');
  });
});
