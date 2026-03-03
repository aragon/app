class SafeBigIntUtils {
    /**
     * Safely parses bigint values coming from APIs.
     * Accepts integer strings and decimal strings with a zero-only fraction
     * (e.g. "1000000.0", "42.000"), and returns null for invalid values.
     */
    toBigInt = (
        value: string | number | bigint | null | undefined,
    ): bigint | null => {
        if (value == null) {
            return null;
        }

        if (typeof value === 'bigint') {
            return value;
        }

        if (typeof value === 'number') {
            return Number.isInteger(value) ? BigInt(value) : null;
        }

        const normalizedValue = value.trim();
        if (normalizedValue.length === 0) {
            return null;
        }

        // Support backend values like "10000000000000000000000000.0".
        const normalizedInteger = normalizedValue.replace(/\.0+$/, '');

        if (!/^\d+$/.test(normalizedInteger)) {
            return null;
        }

        return BigInt(normalizedInteger);
    };
}

export const safeBigIntUtils = new SafeBigIntUtils();
