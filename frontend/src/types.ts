export type Goal = 'weight_loss' | 'weight_gain' | 'maintain' | 'muscle_building';

export const GOALS: Record<Goal, string> = {
  weight_loss: 'Weight Loss',
  weight_gain: 'Weight Gain',
  maintain: 'Maintain',
  muscle_building: 'Muscle Building',
};

export interface Profile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  activityLevel: string;
}
export interface FitnessPlan {
  goal: Goal; bmi: number; bmr: number; tdee: number;
  targetCalories: number; proteinG: number; carbsG: number; fatG: number;
}
export interface Exercise {
  name: string; equipment: string; sets?: number; reps?: number; durationMin?: number;
}
export interface WorkoutDay { dayOfWeek: number; title: string; difficulty: string; exercises: Exercise[] }
export interface DietItem { food: string; portion: string; proteinG: number; carbsG: number; fatG: number }
export interface Meal { mealType: string; calories: number; items: DietItem[] }
export interface Reminder { id: number; label: string; time: string; enabled: boolean }
export interface WeightLog { id: number; date: string; weightKg: number }
export interface WaterLog { id: number; date: string; glasses: number }
export interface SleepLog { id: number; date: string; hours: number }
export interface DashboardData {
  profile: Profile | null; plan: FitnessPlan | null;
  water: WaterLog | null; sleep: SleepLog | null;
  workouts: WorkoutDay[]; reminders: Reminder[];
}
