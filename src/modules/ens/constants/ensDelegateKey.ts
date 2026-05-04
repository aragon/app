import { Network } from '@/shared/api/daoService';

/**
 * Per-network shortname used as the leading segment of the delegate-statement
 * ENS text-record key: `<shortname>.<tokenAddress>.delegate`.
 *
 * Citation: EIP-3770 chain shortnames (https://eips.ethereum.org/EIPS/eip-3770)
 * via the ethereum-lists/chains registry. Safe URLs derive from the same source.
 *
 * Only Ethereum mainnet is enrolled here. The verified precedent is the ENS
 * DAO's own `eth.ens.delegate` record, which is mainnet-only. There is no
 * established ENS-side convention for cross-chain delegate-statement keys yet
 * (the L2/testnet question is pending feedback from ENS on this ticket's
 * proposed schema). Hard-coding L2 shortnames before that decision risks
 * locking us into the wrong cross-chain key shape.
 *
 * Adding a network: only after ENS confirms the cross-chain convention. The
 * key builder fails noisily for any unmapped network so a placeholder key
 * cannot accidentally be published on-chain.
 */
export const NETWORK_EIP3770_SHORTNAME: Partial<Record<Network, string>> = {
    [Network.ETHEREUM_MAINNET]: 'eth',
};

export interface IBuildEnsDelegateKeyParams {
    network: Network;
    tokenAddress: string;
}

/**
 * Builds the ENS text-record key used to anchor a per-token delegate
 * statement. Throws when the network lacks an agreed shortname so the
 * caller does not write a CID against a placeholder key.
 */
export const buildEnsDelegateKey = (
    params: IBuildEnsDelegateKeyParams,
): string => {
    const { network, tokenAddress } = params;
    const shortname = NETWORK_EIP3770_SHORTNAME[network];

    if (shortname == null) {
        throw new Error(
            `No EIP-3770 shortname mapped for network "${network}".`,
        );
    }

    return `${shortname}.${tokenAddress.toLowerCase()}.delegate`;
};
