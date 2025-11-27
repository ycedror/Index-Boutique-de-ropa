export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  generatedImage: string | null;
}

export interface PromptConfig {
  text: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}