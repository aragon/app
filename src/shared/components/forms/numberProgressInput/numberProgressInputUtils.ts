class NumberProgressInputUtils {
    /**
     * Converts a number to its full decimal string representation,
     * preventing the use of scientific notation for small numbers (e.g., 1.23e-7).
     *
     * @param num - The number to convert to a full decimal string
     * @returns The full decimal representation of the number as a string.
     * Returns the original input cast to a string if it's not a valid number.
     */
    toFullDecimalString = (num: unknown): string => {
        // Return early if the input isn't a number in scientific notation.
        const numStr = String(num);
        if (typeof num !== 'number' || isNaN(num) || !numStr.includes('e-')) {
            return numStr;
        }

        // Deconstruct the scientific notation string.
        const [mantissa, exponent] = numStr.split('e-');

        // Get all digits from the mantissa, removing the decimal point and sign.
        const digits = mantissa.replace('.', '').replace('-', '');

        // Calculate the required number of leading zeros.
        const exponentValue = parseInt(exponent, 10);
        const leadingZeros = '0'.repeat(exponentValue - 1);

        // Get the sign for the final string.
        const sign = num < 0 ? '-' : '';

        // Assemble the final decimal string.
        return `${sign}0.${leadingZeros}${digits}`;
    };
}

export const numberProgressInputUtils = new NumberProgressInputUtils();
