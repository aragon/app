'use client';

import { formatterUtils, invariant, NumberFormat } from '@aragon/gov-ui-kit';
import { useEffect, useRef } from 'react';
import type { Network } from '@/shared/api/daoService';
import {
    type TranslationFunction,
    useTranslations,
} from '@/shared/components/translationsProvider';
import {
    GasLimitEstimationStatus,
    type IGasLimitEstimation,
    useEstimateGasLimit,
} from '../../../api/crossChainControllerService';
import { crossChainControllerGas } from '../../../constants/crossChainControllerGas';
import { crossChainControllerGasUtils } from './crossChainControllerGasUtils';

/**
 * Minimal shape of a nested action needed to estimate its gas cost on the destination chain.
 */
export interface IGasLimitEstimationAction {
    to: string;
    value: string;
    data: string;
}

export interface IUseCrossChainControllerGasLimitParams {
    /**
     * Network of the DAO, i.e. the origin chain the message is forwarded from.
     */
    daoNetwork?: Network;
    /**
     * Address of the cross-chain controller the gas limit is estimated for.
     */
    controllerAddress: string;
    /**
     * Standard chain id of the chain the message is forwarded to.
     */
    destinationChainId?: number;
    /**
     * Actions the destination executor runs as a single batch.
     */
    nestedActions: IGasLimitEstimationAction[];
    /**
     * Callback called to update the gas-limit field value.
     */
    onGasLimitChange: (value?: string) => void;
}

export interface IGasLimitEstimationAlert {
    message: string;
    variant: 'critical' | 'warning' | 'success';
}

export interface IUseCrossChainControllerGasLimitResult {
    /**
     * Triggers a new gas-limit simulation for the current destination and actions.
     */
    handleEstimateGasLimit: () => void;
    /**
     * Whether a simulation is currently in flight.
     */
    isEstimating: boolean;
    /**
     * Reports how the last calculation went, ready to render as an alert. Undefined before the
     * first calculation.
     */
    estimationAlert?: IGasLimitEstimationAlert;
    /**
     * URL of the saved Tenderly simulation, when the last calculation ran one.
     */
    simulationUrl?: string;
}

const formatGas = (gas?: string) =>
    formatterUtils.formatNumber(gas ?? '0', {
        format: NumberFormat.GENERIC_SHORT,
    });

interface IBuildEstimationAlertParams {
    t: TranslationFunction;
    estimation: IGasLimitEstimation | undefined;
    isEstimationError: boolean;
}

/**
 * Turns the last simulation outcome into a user-facing alert. The backend only measures - the
 * verdicts about margin and cap are the client's, applied here via `crossChainControllerGasUtils`.
 */
const buildEstimationAlert = (
    params: IBuildEstimationAlertParams,
): IGasLimitEstimationAlert | undefined => {
    const { t, estimation, isEstimationError } = params;
    const translationPrefix =
        'app.plugins.crossChainController.crossChainControllerForwardMessageAction.gas';

    if (isEstimationError) {
        return {
            message: t(`${translationPrefix}.error`),
            variant: 'critical',
        };
    }

    if (estimation == null) {
        return undefined;
    }

    if (estimation.status === GasLimitEstimationStatus.REVERTED) {
        return {
            message: t(`${translationPrefix}.reverted`, {
                reason:
                    estimation.revertReason ??
                    t(`${translationPrefix}.unknownReason`),
            }),
            variant: 'critical',
        };
    }

    if (estimation.requiredGas == null) {
        return undefined;
    }

    const { isMarginReduced, exceedsMaxGasLimit } =
        crossChainControllerGasUtils.resolveGasLimit({
            requiredGas: BigInt(estimation.requiredGas),
        });

    // The backend never checks the requirement against the cap, so this is the client's own
    // verdict: no choice of margin makes this deliverable, the batch has to be split.
    if (exceedsMaxGasLimit) {
        return {
            message: t(`${translationPrefix}.exceedsMax`, {
                maxGasLimit: formatGas(
                    crossChainControllerGas.maxGasLimit.toString(),
                ),
            }),
            variant: 'critical',
        };
    }

    // The limit still covers the measured requirement, it just carries less headroom than the
    // configured margin, which is worth saying out loud.
    if (isMarginReduced) {
        return {
            message: t(`${translationPrefix}.marginReduced`, {
                requiredGas: formatGas(estimation.requiredGas),
            }),
            variant: 'warning',
        };
    }

    return {
        message: t(`${translationPrefix}.simulated`, {
            requiredGas: formatGas(estimation.requiredGas),
            bufferPercent: crossChainControllerGas.bufferPercent,
        }),
        variant: 'success',
    };
};

/**
 * Estimates the `_gasLimit` a `forwardMessage` action needs, applying the client-side safety
 * margin, floor and cap on top of the backend's bare measurement (see `crossChainControllerGas`).
 *
 * Also clears a previously calculated limit whenever the destination or the actions change: a
 * limit measured for a different payload is worse than none - it looks authoritative and is
 * silently wrong.
 */
export const useCrossChainControllerGasLimit = (
    params: IUseCrossChainControllerGasLimitParams,
): IUseCrossChainControllerGasLimitResult => {
    const {
        daoNetwork,
        controllerAddress,
        destinationChainId,
        nestedActions,
        onGasLimitChange,
    } = params;

    const { t } = useTranslations();

    const {
        mutate: estimateGasLimit,
        data: estimation,
        isPending: isEstimating,
        isError: isEstimationError,
        reset: resetEstimation,
    } = useEstimateGasLimit();

    // The gas limit is measured against a specific payload on a specific chain, so it is only
    // valid for the pair it was calculated from.
    const estimationSubject = `${destinationChainId?.toString() ?? ''}:${JSON.stringify(nestedActions)}`;
    const lastEstimationSubject = useRef(estimationSubject);

    useEffect(() => {
        if (lastEstimationSubject.current === estimationSubject) {
            return;
        }

        lastEstimationSubject.current = estimationSubject;
        onGasLimitChange(undefined);
        resetEstimation();
    }, [estimationSubject, onGasLimitChange, resetEstimation]);

    const handleEstimateGasLimit = () => {
        invariant(
            daoNetwork != null && destinationChainId != null,
            'useCrossChainControllerGasLimit: network and destination must be set to estimate gas.',
        );

        // Every calculation starts from an empty field, so an outcome that yields no usable limit -
        // an error, a revert, or a requirement above the cap - cannot leave the previous value
        // behind, looking authoritative and still submittable.
        onGasLimitChange(undefined);

        estimateGasLimit(
            {
                urlParams: { network: daoNetwork, controllerAddress },
                body: {
                    destinationChainId,
                    actions: nestedActions.map(({ to, value, data }) => ({
                        to,
                        value: value || '0',
                        data: data || '0x',
                    })),
                },
            },
            {
                // The backend only measures. The safety margin, floor and cap on top of that
                // measurement are a product decision and are applied here.
                onSuccess: (result) => {
                    if (
                        result.status !== GasLimitEstimationStatus.SUCCESS ||
                        result.requiredGas == null
                    ) {
                        return;
                    }

                    const { gasLimit: resolvedGasLimit, exceedsMaxGasLimit } =
                        crossChainControllerGasUtils.resolveGasLimit({
                            requiredGas: BigInt(result.requiredGas),
                        });

                    // No choice of margin makes this deliverable; leaving the field empty keeps
                    // the required rule from letting a wrong-but-plausible value reach the
                    // proposal.
                    if (exceedsMaxGasLimit) {
                        return;
                    }

                    onGasLimitChange(resolvedGasLimit.toString());
                },
            },
        );
    };

    return {
        handleEstimateGasLimit,
        isEstimating,
        estimationAlert: buildEstimationAlert({
            t,
            estimation,
            isEstimationError,
        }),
        simulationUrl: estimation?.simulationUrl,
    };
};
