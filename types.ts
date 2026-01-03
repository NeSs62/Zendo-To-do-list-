
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  day: string;
  createdAt: number;
}

export type Theme = 'dark';

export interface AppSettings {
  theme: Theme;
  backgroundImage: string;
}
