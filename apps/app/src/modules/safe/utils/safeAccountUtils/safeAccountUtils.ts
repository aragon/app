// biome-ignore lint/style/noRestrictedImports: the route resolves params in a server component, where the gov-ui-kit client shim is unavailable; `strict: false` matches addressUtils.isAddress
import { getAddress, isAddress } from 'viem';
import { networkUtils } from '@/shared/utils/networkUtils';
import type { ISafeAccountPageParams } from '../../types';

class SafeAccountUtils {
    /**
     * Validates the route parameters of the Safe account view and normalises the address to its
     * checksum, so that every downstream read uses one form. Returns undefined for an unknown
     * network or a malformed address: a malformed URL is a missing page, never a server error.
     *
     * Viem is used rather than the gov-ui-kit `addressUtils` (which wraps these very functions)
     * because the app aliases `@aragon/gov-ui-kit` onto a `'use client'` module, so its exports
     * are client references in a server component.
     */
    resolveSafeAccount = (
        params: ISafeAccountPageParams,
    ): ISafeAccountPageParams | undefined => {
        const { network, address } = params;

        const isValidParams =
            networkUtils.isValidNetwork(network) &&
            isAddress(address, { strict: false });

        if (!isValidParams) {
            return undefined;
        }

        return { network, address: getAddress(address) };
    };
}

export const safeAccountUtils = new SafeAccountUtils();
