'use client';

import { ActionSimulation } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import {
    actionSimulationServiceKeys,
    type ISafeTransactionSimulationUrlParams,
    type ISimulationResult,
    useLastSafeTransactionSimulation,
    useSimulateSafeTransaction,
} from '@/modules/governance/api/actionSimulationService';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import type { Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';

export interface ISafeTransactionSimulationProps {
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Address of the Safe the transaction belongs to.
     */
    safeAddress: string;
    /**
     * Hash of the pending Safe transaction.
     */
    safeTxHash: string;
    /**
     * Number of actions the transaction performs.
     */
    actionCount: number;
}

const translationKey = 'app.safe.safeTransactionSimulation';

// Same rule as the proposal page: a transaction cannot be simulated again within 10 minutes of its last run.
const simulationLimitMillis = 10 * 60 * 1000;

// The backend answers 429 once the Tenderly budget is exhausted.
const isSimulationLimitError = (error: unknown): boolean =>
    error instanceof AragonBackendServiceError && error.status === 429;

/**
 * Tenderly simulation of a pending Safe transaction: its last stored run, and the action to simulate it again once the
 * last run is older than 10 minutes. Not rendered on networks Tenderly does not support.
 */
export const SafeTransactionSimulation: React.FC<
    ISafeTransactionSimulationProps
> = (props) => {
    const { network, safeAddress, safeTxHash, actionCount } = props;

    const { t } = useTranslations();
    const queryClient = useQueryClient();

    const { tenderlySupport } = networkDefinitions[network];
    const urlParams: ISafeTransactionSimulationUrlParams = {
        network,
        safeAddress,
        safeTxHash,
    };

    const { data: lastSimulation, error: lastSimulationError } =
        useLastSafeTransactionSimulation(
            { urlParams },
            { enabled: tenderlySupport },
        );

    // The run is stored, so it becomes the last simulation without reading it again.
    const handleSimulationSuccess = (result: ISimulationResult) =>
        queryClient.setQueryData(
            actionSimulationServiceKeys.lastSafeTransactionSimulation({
                urlParams,
            }),
            result,
        );

    const {
        mutate: simulateSafeTransaction,
        isPending: isSimulating,
        error: simulationError,
    } = useSimulateSafeTransaction({ onSuccess: handleSimulationSuccess });

    if (!tenderlySupport) {
        return null;
    }

    const handleSimulate = () => simulateSafeTransaction({ urlParams });

    const canSimulate =
        lastSimulation == null ||
        Date.now() - lastSimulation.runAt > simulationLimitMillis;

    // A transaction that was never simulated has no last run, which is not an error.
    const hasLastSimulationError =
        lastSimulationError != null &&
        !AragonBackendServiceError.isNotFoundError(lastSimulationError);

    let errorKey: string | undefined;
    if (simulationError != null) {
        errorKey = isSimulationLimitError(simulationError)
            ? 'limitReached'
            : 'simulationError';
    } else if (hasLastSimulationError) {
        errorKey = 'lastSimulationError';
    }

    return (
        <ActionSimulation
            error={
                errorKey == null
                    ? undefined
                    : t(`${translationKey}.${errorKey}`)
            }
            isEnabled={canSimulate}
            isLoading={isSimulating}
            lastSimulation={
                lastSimulation == null
                    ? undefined
                    : { ...lastSimulation, timestamp: lastSimulation.runAt }
            }
            onSimulate={handleSimulate}
            totalActions={actionCount}
        />
    );
};
