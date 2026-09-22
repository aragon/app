export const isRecord = (value: unknown): value is Record<string, unknown> =>
    value != null && typeof value === 'object' && !Array.isArray(value);

export const isStringArray = (value: unknown): value is string[] =>
    Array.isArray(value) && value.every((item) => typeof item === 'string');

export const isUnsignedIntegerString = (value: unknown): value is string =>
    typeof value === 'string' && /^\d+$/.test(value);
