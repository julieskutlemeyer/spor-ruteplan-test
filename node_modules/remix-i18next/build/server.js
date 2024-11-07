import { createInstance, } from "i18next";
import { getClientLocales } from "./lib/get-client-locales.js";
import { pick } from "./lib/parser.js";
export class RemixI18Next {
    options;
    detector;
    constructor(options) {
        this.options = options;
        this.detector = new LanguageDetector(this.options.detection);
    }
    /**
     * Detect the current locale by following the order defined in the
     * `detection.order` option.
     * By default the order is
     * - searchParams
     * - cookie
     * - session
     * - header
     * And finally the fallback language.
     */
    async getLocale(request) {
        return this.detector.detect(request);
    }
    /**
     * Get the namespaces required by the routes which are going to be rendered
     * when doing SSR.
     *
     * @param context The EntryContext object received by `handleRequest` in entry.server
     *
     * @example
     * await instance.init({
     *   ns: i18n.getRouteNamespaces(context),
     *   // ...more options
     * });
     */
    getRouteNamespaces(context) {
        let namespaces = Object.values(context.routeModules).flatMap((route) => {
            if (typeof route?.handle !== "object")
                return [];
            if (!route.handle)
                return [];
            if (!("i18n" in route.handle))
                return [];
            if (typeof route.handle.i18n === "string")
                return [route.handle.i18n];
            if (Array.isArray(route.handle.i18n) &&
                route.handle.i18n.every((value) => typeof value === "string")) {
                return route.handle.i18n;
            }
            return [];
        });
        return [...new Set(namespaces)];
    }
    async getFixedT(requestOrLocale, namespaces, options = {}) {
        let [instance, locale] = await Promise.all([
            this.createInstance({ ...this.options.i18next, ...options }),
            typeof requestOrLocale === "string"
                ? requestOrLocale
                : this.getLocale(requestOrLocale),
        ]);
        await instance.changeLanguage(locale);
        if (namespaces)
            await instance.loadNamespaces(namespaces);
        else if (instance.options.defaultNS) {
            await instance.loadNamespaces(instance.options.defaultNS);
        }
        else
            await instance.loadNamespaces("translation");
        return instance.getFixedT(locale, namespaces, options?.keyPrefix);
    }
    async createInstance(options = {}) {
        let instance = createInstance();
        let plugins = [
            ...(this.options.backend ? [this.options.backend] : []),
            ...(this.options.plugins || []),
        ];
        for (const plugin of plugins)
            instance.use(plugin);
        await instance.init(options);
        return instance;
    }
}
/**
 * The LanguageDetector contains the logic to detect the user preferred language
 * fully server-side by using a SessionStorage, Cookie, URLSearchParams, or
 * Headers.
 */
export class LanguageDetector {
    options;
    constructor(options) {
        this.options = options;
        this.isSessionOnly(options);
        this.isCookieOnly(options);
    }
    isSessionOnly(options) {
        if (options.order?.length === 1 &&
            options.order[0] === "session" &&
            !options.sessionStorage) {
            throw new Error("You need a sessionStorage if you want to only get the locale from the session");
        }
    }
    isCookieOnly(options) {
        if (options.order?.length === 1 &&
            options.order[0] === "cookie" &&
            !options.cookie) {
            throw new Error("You need a cookie if you want to only get the locale from the cookie");
        }
    }
    async detect(request) {
        let order = this.options.order ?? this.defaultOrder;
        for (let method of order) {
            let locale = null;
            if (method === "searchParams") {
                locale = this.fromSearchParams(request);
            }
            if (method === "cookie") {
                locale = await this.fromCookie(request);
            }
            if (method === "session") {
                locale = await this.fromSessionStorage(request);
            }
            if (method === "header") {
                locale = this.fromHeader(request);
            }
            if (method === "custom") {
                locale = await this.fromCustom(request);
            }
            if (locale)
                return locale;
        }
        return this.options.fallbackLanguage;
    }
    get defaultOrder() {
        let order = ["searchParams", "cookie", "session", "header"];
        if (this.options.findLocale)
            order.unshift("custom");
        return order;
    }
    fromSearchParams(request) {
        let url = new URL(request.url);
        if (!url.searchParams.has(this.options.searchParamKey ?? "lng")) {
            return null;
        }
        return this.fromSupported(url.searchParams.get(this.options.searchParamKey ?? "lng"));
    }
    async fromCookie(request) {
        if (!this.options.cookie)
            return null;
        let cookie = this.options.cookie;
        let lng = await cookie.parse(request.headers.get("Cookie"));
        if (typeof lng !== "string" || !lng)
            return null;
        return this.fromSupported(lng);
    }
    async fromSessionStorage(request) {
        if (!this.options.sessionStorage)
            return null;
        let session = await this.options.sessionStorage.getSession(request.headers.get("Cookie"));
        let lng = session.get(this.options.sessionKey ?? "lng");
        if (!lng)
            return null;
        return this.fromSupported(lng);
    }
    fromHeader(request) {
        let locales = getClientLocales(request);
        if (!locales)
            return null;
        if (Array.isArray(locales))
            return this.fromSupported(locales.join(","));
        return this.fromSupported(locales);
    }
    async fromCustom(request) {
        if (!this.options.findLocale) {
            throw new ReferenceError("You tried to find a locale using `findLocale` but it iss not defined. Change your order to not include `custom` or provide a findLocale functions.");
        }
        let locales = await this.options.findLocale(request);
        if (!locales)
            return null;
        if (Array.isArray(locales))
            return this.fromSupported(locales.join(","));
        return this.fromSupported(locales);
    }
    fromSupported(language) {
        return (pick(this.options.supportedLanguages, language ?? this.options.fallbackLanguage, { loose: false }) ||
            pick(this.options.supportedLanguages, language ?? this.options.fallbackLanguage, { loose: true }));
    }
}
//# sourceMappingURL=server.js.map