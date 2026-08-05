export interface Language {
  code: string;
  name: string;
}

export const LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English'
  }
];

export const DEFAULT_LANGUAGE = LANGUAGES[0];
