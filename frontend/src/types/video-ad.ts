export interface VideoAdScene {
  sceneNumber: number;
  durationSec: number;
  title: string;
  visualPrompt: string;
  cameraDirection: string;
  voiceoverText: string;
  subtitleText: string;
  codeSnippet?: string;
  highlightBadge?: string;
  soundEffect?: string;
  imageUrl?: string;
}

export interface VideoAdResponse {
  id: string;
  title: string;
  hook: string;
  targetAudience: string;
  tone: string;
  durationTotalSec: number;
  backgroundMusicGenre: string;
  scenes: VideoAdScene[];
  ctaText: string;
  ctaUrl: string;
  generatedBy: string;
}

export interface VideoAdTemplate {
  id: string;
  name: string;
  productName: string;
  targetAudience: string;
  tone: string;
  duration: '15s' | '30s' | '60s';
  description: string;
}
