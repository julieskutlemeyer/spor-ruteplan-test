import type { Language } from "./parser.js";
export declare function formatLanguageString(language: Pick<Language, "code" | "region" | "script">): string;
