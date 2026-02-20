
import { FounderLifestyle, Tone, ContentStrength } from './types';

export const LIFESTYLE_OPTIONS: FounderLifestyle[] = [
  'I can post daily',
  '4–5 days/week',
  '3 days/week',
  'Weekends only',
  'Mornings only',
  'Nights only'
];

export const TONE_OPTIONS: Tone[] = [
  'Authoritative',
  'Professional & Warm',
  'Sharp & Direct',
  'Friendly',
  'Visionary'
];

export const STRENGTH_OPTIONS: ContentStrength[] = [
  'Educational',
  'Storytelling',
  'Analytical',
  'Contrarian',
  'Inspirational',
  'Humorous'
];

export const DEFAULT_APP_STATE = {
  lifestyle: '' as any,
  icp: '',
  strengths: [] as ContentStrength[],
  tone: '' as any
};
