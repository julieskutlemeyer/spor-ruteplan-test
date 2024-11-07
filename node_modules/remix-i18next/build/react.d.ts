/**
 * Get the locale returned by the root route loader under the `locale` key.
 * @example
 * let locale = useLocale()
 * let formattedDate = date.toLocaleDateString(locale);
 * @example
 * let locale = useLocale("language")
 * let formattedDate = date.toLocaleDateString(locale);
 */
export declare function useLocale(localeKey?: string): string;
/**
 * Detect when the locale returned by the root route loader changes and call
 * `i18n.changeLanguage` with the new locale.
 * This will ensure translations are loaded automatically.
 */
export declare function useChangeLanguage(locale: string): void;
