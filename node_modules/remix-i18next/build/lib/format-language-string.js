export function formatLanguageString(language) {
    let parts = [language.code];
    if (language.script)
        parts.push(language.script);
    if (language.region)
        parts.push(language.region);
    return parts.join("-");
}
//# sourceMappingURL=format-language-string.js.map