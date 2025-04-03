export const languages = [
  "english",
  "chinese",
  "spanish",
  "arabic", 
  "portuguese",
  "french",
  "russian",
  "german",
  "ukrainian"
] as const

export const defaultLanguage = languages[0]

export type Language = typeof languages[number]

export const langSettings: Record<Language, {
  iso_639_1: string,
  regionCode?: string,
  indexType?: string
}> = {
  english: { iso_639_1: 'en', regionCode: 'en-US'},
  chinese: { iso_639_1: 'zh', regionCode: 'zh-HANS', indexType: 'groonga'},
  spanish: {iso_639_1: 'es'},
  arabic: {iso_639_1: 'ar'},
  portuguese: {iso_639_1: 'pt', regionCode: 'pt-BR'},
  french: {iso_639_1: 'fr'},
  russian: {iso_639_1: 'ru'},
  german: {iso_639_1: 'de'},
  ukrainian: {iso_639_1: 'uk', indexType: 'groonga'}
}


type TranslatedValues = {
  [key in Language]: string
}

export type TranslatedString = TranslatedValues & {
  original_language: Language
}