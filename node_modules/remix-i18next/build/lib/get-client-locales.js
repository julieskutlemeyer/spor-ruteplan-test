import { formatLanguageString } from "./format-language-string.js";
import { parse, pick } from "./parser.js";
export function getClientLocales(requestOrHeaders) {
    let headers = getHeaders(requestOrHeaders);
    let acceptLanguage = headers.get("Accept-Language");
    // if the header is not defined, return undefined
    if (!acceptLanguage)
        return undefined;
    let parsedLocales = parse(acceptLanguage)
        .filter((lang) => lang.code !== "*")
        .map(formatLanguageString);
    let validLocales = [];
    for (let locale of parsedLocales) {
        try {
            // This will throw on invalid locales
            new Intl.Locale(locale);
            // If we get here, the locale is valid
            validLocales.push(locale);
        }
        catch {
            // We want to ignore errors here
        }
    }
    let locale = pick(Intl.DateTimeFormat.supportedLocalesOf(validLocales), acceptLanguage);
    return locale ?? undefined;
}
/**
 * Receives a Request or Headers objects.
 * If it's a Request returns the request.headers
 * If it's a Headers returns the object directly.
 */
function getHeaders(requestOrHeaders) {
    if (requestOrHeaders instanceof Request)
        return requestOrHeaders.headers;
    return requestOrHeaders;
}
//# sourceMappingURL=get-client-locales.js.map