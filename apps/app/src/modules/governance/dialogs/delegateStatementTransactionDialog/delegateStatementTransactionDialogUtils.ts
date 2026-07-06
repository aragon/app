import { encodeFunctionData } from 'viem';
import { namehash } from 'viem/ens';
import { buildEnsDelegateKey } from '@/modules/ens';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import type { IBuildDelegateStatementTransactionParams } from './delegateStatementTransactionDialogUtils.api';
import { ensPublicResolverAbi } from './ensPublicResolverAbi';

class DelegateStatementTransactionDialogUtils {
    /**
     * Encodes the ENS Public Resolver `setText` call that anchors a delegate
     * statement CID to `<eip3770Shortname>.<tokenAddress>.delegate` on the
     * connected wallet's primary ENS name.
     *
     * The pin must already have completed before this runs — `cid` is the
     * IPFS hash returned by `usePinJson` in the preceding step.
     */
    buildTransaction = (
        params: IBuildDelegateStatementTransactionParams,
    ): ITransactionRequest => {
        const { resolverAddress, ensName, network, tokenAddress, cid } = params;

        const node = namehash(ensName);
        const key = buildEnsDelegateKey({ network, tokenAddress });
        const value = `ipfs://${cid}`;

        const data = encodeFunctionData({
            abi: ensPublicResolverAbi,
            functionName: 'setText',
            args: [node, key, value],
        });

        return {
            to: resolverAddress,
            data,
            value: BigInt(0),
        };
    };
}

export const delegateStatementTransactionDialogUtils =
    new DelegateStatementTransactionDialogUtils();
