import { useMemo } from 'react';
import { BaseError, ExecutionRevertedError } from 'viem';
import { useCall } from 'wagmi';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import type { IDaoPlugin, Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { publishProposalDialogUtils } from '../../dialogs/publishProposalDialog/publishProposalDialogUtils';

export interface IUseSimulateProposalCreationParams {
    /**
     * Plugin used to create a proposal.
     */
    plugin: IDaoPlugin;
    /**
     * Network of the DAO.
     */
    network?: Network;
}

export interface IUseSimulateProposalCreationResult {
    /**
     * Whether the simulation request is in progress.
     */
    isLoading: boolean;
    /**
     * Whether the simulation request has failed.
     */
    isError: boolean;
    /**
     * Simulation result.
     */
    result?: 'success' | 'failure';
}

const dummyProposal = {
    actions: [],
    title: 'Test title',
    summary: 'Test description',
    body: '',
    addActions: true,
    resources: [],
    startTimeMode: 'now',
};

const dummyCid = 'QmVZjGBGNmkgTsch6E8Eu1EzYJRqZZKQZoc2xRaySanWvs';

/**
 * Simulates a proposal creation transaction to check if the user has permission to create a proposal.
 */
export const useSimulateProposalCreation = (
    params: IUseSimulateProposalCreationParams,
): IUseSimulateProposalCreationResult => {
    const { plugin, network } = params;
    const { address: userAddress } = useWalletAccount();

    const chainId =
        network != null ? networkDefinitions[network].id : undefined;

    const isEnabled = userAddress != null && chainId != null;

    // Memoized so the calldata (which embeds a now-relative end date) is built
    // once and does not change the useCall query key on every render, which
    // would re-trigger the RPC simulation on each render.
    const transactionData = useMemo(
        () =>
            isEnabled
                ? publishProposalDialogUtils.buildTransaction({
                      proposal: dummyProposal,
                      metadataCid: dummyCid,
                      plugin,
                  })
                : undefined,
        [isEnabled, plugin],
    );

    const { isLoading, isError, error, isSuccess } = useCall({
        account: userAddress,
        chainId,
        ...transactionData,
        query: {
            enabled: isEnabled,
        },
    });

    // Only ExecutionRevertedError is treated as a simulation failure. All other
    // errors represent failed simulation request, e.g., RPC not available.
    const revertError =
        isError && error instanceof BaseError
            ? error.walk((e) => e instanceof ExecutionRevertedError)
            : undefined;
    const isRequestError = isError && revertError == null;
    const isSimulationError = isError && revertError != null;

    return {
        isLoading,
        isError: isRequestError,
        result: isSuccess
            ? 'success'
            : isSimulationError
              ? 'failure'
              : undefined,
    };
};
