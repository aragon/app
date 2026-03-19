import { useSearchParams } from 'next/navigation';

/**
 * Returns an impersonated address from the `?impersonate=0x...` URL param.
 * Active in development and Vercel preview environments only — returns `undefined` in production.
 *
 * **Experimental / dev-only tool.** This override applies to frontend read-only logic only
 * (e.g. member list pinning, UI state). It does NOT affect wallet signing, on-chain transactions,
 * or any wagmi hook that talks to the blockchain. Features that rely on `useAccount()` internally
 * (e.g. gov-ui-kit's "You" tag) will still use the real connected wallet.
 *
 * Usage: append `?impersonate=0x...` to any page URL in dev/preview.
 */
export const useImpersonatedAddress = (): string | undefined => {
    const searchParams = useSearchParams();

    if (
        process.env.NODE_ENV !== 'development' &&
        process.env.NEXT_PUBLIC_VERCEL_ENV !== 'preview'
    ) {
        return undefined;
    }

    return searchParams.get('impersonate') ?? undefined;
};
