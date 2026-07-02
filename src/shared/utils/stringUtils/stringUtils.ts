const WORD_SEPARATOR_REGEX = /[^a-z0-9]+/i;

class StringUtils {
    /**
     * Type guard narrowing an unknown value to a non-empty string.
     */
    isNonEmptyString = (value: unknown): value is string =>
        typeof value === 'string' && value.length > 0;

    /**
     * Converts a delimited string (e.g. `execute-selector`) into its Pascal-cased
     * form (e.g. `ExecuteSelector`). Any non-alphanumeric run is treated as a word
     * boundary.
     */
    toPascalCase = (value: string): string =>
        value
            .split(WORD_SEPARATOR_REGEX)
            .filter((word) => word.length > 0)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
}

export const stringUtils = new StringUtils();
