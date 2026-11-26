import { type MutationOptions, useMutation } from '@tanstack/react-query';
import {
    type ISafeTransactionCall,
    safeProtocolKitUtils,
} from '@/modules/safe/utils/safeProtocolKitUtils';
import type { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { actionSimulationService } from '../../actionSimulationService';
import type { ISimulationResult } from '../../domain';

export interface IUseSimulateSafeActionsParams {
    /**
     * Network the Safe is on.
     */
    network: Network;
    /**
     * Address of the Safe that runs the actions.
     */
    safeAddress: string;
    /**
     * Actions the Safe transaction is made of.
     */
    actions: ISafeTransactionCall[];
}

/**
 * Builds the Safe transaction the actions make up, as the create dialog does, with a protocol kit that only reads, and
 * simulates it before it is created. A failed build fails the mutation like a failed request.
 */
export const useSimulateSafeActions = (
    options?: MutationOptions<
        ISimulationResult,
        unknown,
        IUseSimulateSafeActionsParams
    >,
) =>
    useMutation({
        mutationFn: async ({ network, safeAddress, actions }) => {
            const protocolKit = await safeProtocolKitUtils.initReadOnly({
                chainId: networkDefinitions[network].id,
                safeAddress,
            });
            const body = await safeProtocolKitUtils.buildTransactionCall({
                protocolKit,
                calls: actions,
            });

            return actionSimulationService.simulateSafeActions({
                urlParams: { network, safeAddress },
                body,
            });
        },
        ...options,
    });
