
export enum SummaryType {
  SHORT = 'Short',
  DETAILED = 'Detailed',
  BULLETS = 'Bullet Points',
  TAKEAWAYS = 'Key Takeaways'
}

export interface SummaryResult {
  url: string;
  title: string;
  paragraph: string;
  bullets: string[];
  insights: string[];
  readingTimeOriginal: number;
  readingTimeSummary: number;
  language: string;
  sources?: Array<{ web: { uri: string; title: string } }>;
}

export interface AppState {
  urls: string[];
  summaries: SummaryResult[];
  isLoading: boolean;
  selectedSummaryType: SummaryType;
  selectedLanguage: string;
}
