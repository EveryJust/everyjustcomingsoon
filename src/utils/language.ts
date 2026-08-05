export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    flag: 'https://flagcdn.com/w20/us.png'
  }
];

export const DEFAULT_LANGUAGE = LANGUAGES[0];
