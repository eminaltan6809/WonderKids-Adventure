export enum GameScreen {
  HOME = 'HOME',
  CHARACTER_SELECT = 'CHARACTER_SELECT',
  MAP = 'MAP',
  VEO_STUDIO = 'VEO_STUDIO',
  LIVE_TALK = 'LIVE_TALK',
  MAGIC_PAINTER = 'MAGIC_PAINTER',
  LOGIC_PUZZLES = 'LOGIC_PUZZLES',
  STORY_MODE = 'STORY_MODE'
}

export interface Character {
  id: string;
  name: string;
  avatar: string; // Emoji or URL
  color: string;
}

export interface PuzzleQuestion {
  id: string;
  type: 'pattern' | 'shadow' | 'encryption'; // BİLSEM style categories
  questionImage?: string; // Or description for generation
  questionText: string;
  options: string[];
  correctIndex: number;
}