// Vendored from dao-launchpad@f/lido-demo:lido/preview/ui/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Adapted: imports rewritten to use the in-tree @/shared/lidoPreview vendoring
// of @aragon/lido-preview, with .ts/.tsx extensions stripped for moduleResolution=bundler.

// Shared formatting helpers for addresses and token amounts.

export function shortAddress(addr: string | undefined | null): string {
    if (!addr || !addr.startsWith('0x') || addr.length < 10) {
        return addr ?? '';
    }
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function formatAmount(
    raw: bigint | string | undefined | null,
    decimals: number | null | undefined,
    /** When set, truncate the fractional part to this many digits.  Values
     *  smaller than `10^-maxDecimals` get a `< 0.0001` style indicator so
     *  near-zero "dust" (e.g. 1-wei rebasing leftovers) stays readable
     *  without taking 18 digits of column width. */
    maxDecimals?: number,
): string {
    if (raw === undefined || raw === null) {
        return '?';
    }
    const asStr = typeof raw === 'bigint' ? raw.toString() : String(raw);
    if (!decimals || decimals === 0) {
        return withCommas(asStr);
    }
    return formatWithDecimals(asStr, decimals, maxDecimals);
}

function formatWithDecimals(
    raw: string,
    decimals: number,
    maxDecimals?: number,
): string {
    const isNeg = raw.startsWith('-');
    const digits = isNeg ? raw.slice(1) : raw;
    const padded = digits.padStart(decimals + 1, '0');
    const whole = padded.slice(0, padded.length - decimals);
    let frac = padded.slice(padded.length - decimals);
    // Truncate (not round) — easier to verify against on-chain reads.
    if (maxDecimals !== undefined && frac.length > maxDecimals) {
        frac = frac.slice(0, maxDecimals);
    }
    frac = frac.replace(/0+$/, '');
    const sign = isNeg ? '-' : '';
    const wholeFmt = withCommas(whole);

    // Sub-threshold: non-zero amount whose entire visible representation
    // would be "0".  Surface a hint like `< 0.0001`.
    if (
        maxDecimals !== undefined &&
        digits !== '0' &&
        whole.replace(/^0+/, '') === '' &&
        frac.length === 0
    ) {
        const threshold = `0.${'0'.repeat(Math.max(0, maxDecimals - 1))}1`;
        return `<${sign}${threshold}`;
    }

    return frac.length > 0
        ? `${sign}${wholeFmt}.${frac}`
        : `${sign}${wholeFmt}`;
}

function withCommas(digits: string): string {
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
