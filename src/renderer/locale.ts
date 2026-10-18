export type Locale = 'ja' | 'en' | 'es' | 'pt-BR'

export function localizedPath(locale: Locale) {
  return `/${locale}/`
}
