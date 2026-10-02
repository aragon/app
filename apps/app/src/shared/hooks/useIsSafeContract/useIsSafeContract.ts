import { addressUtils } from '@aragon/gov-ui-kit';
import { zeroAddress } from 'viem';
import { useSafeInfo } from '@/shared/api/safeService';
import type { Network } from '../../api/daoService';
import type { QueryOptions } from '../../types';

export interface IUseIsSafeContractParams {
    /**
     * The contract address to check
     */
    address?: string;
    /**
     * The network where the contract is deployed
     */
    network: Network;
}

/**
 * Answers whether an address is a Safe by reading the Safe's own state - owners, threshold and
 * version - rather than by recognising its name.
 *
 * The previous check fetched the contract's ABI and substring-matched its name against
 * `['GnosisSafe', 'Safe', 'Gnosis Safe', 'SafeProxy']`, which decided both answers wrongly:
 * `SafeMath`, `SafeERC20` or any contract merely containing "Safe" passed and could be attached as
 * a governance body, while a genuine Safe whose ABI lookup failed or returned an unnamed proxy was
 * refused. A name is not an interface.
 *
 * A Safe that does not answer here is also a Safe this app cannot operate - the queue, history and
 * nonce all come from the same read - so "not a Safe" and "not usable as a Safe body" are the same
 * answer, which is the one the caller needs.
 */
export const useIsSafeContract = (
    params: IUseIsSafeContractParams,
    options?: QueryOptions<boolean>,
) => {
    const { address, network } = params;
    const { enabled: enabledOption } = options ?? {};

    const isAddressValid = address != null && addressUtils.isAddress(address);
    const enabled = enabledOption !== false && isAddressValid;

    /**
     * The query key checksums the address as it is built (`safeServiceKeys.safeInfo` ->
     * `checksumSafeAddress`), which throws on anything that is not a 20-byte hex address. Hooks
     * cannot be skipped, so an invalid address is replaced by a well-formed placeholder that is
     * never fetched: `enabled` is already false in exactly that case.
     */
    const { data, isLoading, isError, error } = useSafeInfo(
        {
            urlParams: {
                network,
                address: isAddressValid ? address : zeroAddress,
            },
        },
        { enabled, retry: false },
    );

    return {
        // A response without owners is not a Safe, whatever else answered.
        data: (data?.owners.length ?? 0) > 0,
        isLoading,
        isError,
        error,
    };
};
