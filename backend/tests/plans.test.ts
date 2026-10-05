import { describe, it, expect } from 'vitest';
import { generateWorkoutPlan, generateDietPlan } from '../src/services/plans';

describe('plan generation', () => {
  it('creates a 7-day workout plan, Sunday to Saturday', () => {
    const plan = generateWorkoutPlan('muscle_building', 'moderate');
    expect(plan).toHaveLength(7);
    expect(plan.map((d) => d.dayOfWeek)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(plan.every((d) => d.difficulty === 'intermediate')).toBe(true);
  });

  it('uses more sets for advanced users than beginners', () => {
    const sets = (level: 'light' | 'athlete') =>
      generateWorkoutPlan('maintain', level)
        .flatMap((d) => d.exercises)
        .find((e: any) => e.sets)!.sets as number;
    expect(sets('athlete')).toBeGreaterThan(sets('light'));
  });

  it('creates four meals that add up to the calorie target', () => {
    const diet = generateDietPlan('maintain', 1480);
    expect(diet.map((m) => m.mealType)).toEqual(['breakfast', 'lunch', 'snack', 'dinner']);
    expect(diet.reduce((sum, m) => sum + m.calories, 0)).toBe(1480);
  });

  it('scales portions with the calorie target', () => {
    const small = generateDietPlan('weight_loss', 1200).reduce((s, m) => s + m.calories, 0);
    const big = generateDietPlan('weight_gain', 2600).reduce((s, m) => s + m.calories, 0);
    expect(big).toBeGreaterThan(small);
  });
});
