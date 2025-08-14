import 'server-only';
import type en from './dictionaries/en.json';
import languine from './languine.json';

export const locales = [
  languine.locale.source,
  ...languine.locale.targets,
] as const;

export type Locale = typeof locales[number];
export type Dictionary = typeof en;
type Dictionaries = Record<Locale, () => Promise<Dictionary>>;

const dictionaries = locales.reduce<Dictionaries>((acc, locale) => {
  acc[locale] = () =>
    import(`./dictionaries/${locale}.json`).then((mod) => mod.default);
  return acc;
}, {} as Dictionaries);

export const getDictionary = async (locale: string) => {
  // Check if the requested locale is valid
  const isValidLocale = locales.includes(locale as Locale);
  const safeLocale = isValidLocale ? (locale as Locale) : 'es';

  try {
    const dictionary = await dictionaries[safeLocale]();
    return dictionary;
  } catch (error) {
    console.error(`Failed to load dictionary for locale ${safeLocale}:`, error);
    // Fallback to English if loading fails
    return await dictionaries['es']();
  }
};
