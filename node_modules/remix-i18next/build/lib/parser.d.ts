export interface Language {
    code: string;
    script?: string | null | undefined;
    region?: string | undefined;
    quality: number;
}
export interface PickOptions {
    loose?: boolean | undefined;
}
export declare function parse(acceptLanguage?: string): Language[];
export declare function pick<T extends string>(supportedLanguages: T[], acceptLanguage: string | Language[], options?: PickOptions): T | null;
