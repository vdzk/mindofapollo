export const languages = [
  "english",  // first is the default language
  "chinese",
  "spanish",
  "arabic", 
  "portuguese",
  "french",
  "russian",
  "german",
  "ukrainian"
] as const;

export type Language = typeof languages[number];

export const langSettings: Record<Language, {indexType?: string}> = {
  english: {},
  chinese: { indexType: 'groonga'},
  spanish: {},
  arabic: {},
  portuguese: {},
  french: {},
  russian: {},
  german: {},
  ukrainian: { indexType: 'groonga'}
}

type TranslatedValues = {
  [key in Language]: string
}

export type TranslatedString = TranslatedValues & {
  original_language: Language
}