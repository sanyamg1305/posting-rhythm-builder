
export type FounderLifestyle = 
  | 'I can post daily'
  | '4–5 days/week'
  | '3 days/week'
  | 'Weekends only'
  | 'Mornings only'
  | 'Nights only';

export type Tone = 
  | 'Authoritative'
  | 'Professional & Warm'
  | 'Sharp & Direct'
  | 'Friendly'
  | 'Visionary';

export type ContentStrength = 
  | 'Educational'
  | 'Storytelling'
  | 'Analytical'
  | 'Contrarian'
  | 'Inspirational'
  | 'Humorous';

export interface PostIdea {
  category: string;
  idea: string;
}

export interface PostingStrategy {
  bestPostingDays: {
    explanation: string;
    days: string[];
    timeWindow: string;
  };
  topicCadence: {
    schedule: { day: string; type: string }[];
    psychology: string;
  };
  weeklySystem: {
    routine: { day: string; action: string }[];
  };
  postIdeas: PostIdea[];
  hooks: string[];
  ctas: string[];
}

export interface LeadData {
  name: string;
  companyName: string;
  companyEmail: string;
  companyWebsite: string;
  linkedinUrl: string;
}

export interface AppState {
  lifestyle: FounderLifestyle;
  icp: string;
  strengths: ContentStrength[];
  tone: Tone;
}
