'use client';

import {
    Dialog,
    formatterUtils,
    invariant,
    NumberFormat,
} from '@aragon/gov-ui-kit';
import { useEffect, useMemo, useState } from 'react';
import { parseUnits } from 'viem';
import type { Network } from '@/shared/api/daoService';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IGauge } from '../../api/gaugeVoterService/domain';
import { GaugeVoterPluginDialogId } from '../../constants/gaugeVoterPluginDialogId';
import type {
    IGaugeVote,
    IGaugeVoterVoteTransactionDialogParams,
} from '../gaugeVoterVoteTransactionDialog';
import {
    GaugeVoterVoteDialogContent,
    type IGaugeVoteAllocation,
} from './gaugeVoterVoteDialogContent';
import { GaugeVoterVoteDialogFooter } from './gaugeVoterVoteDialogFooter';

const WEIGHT_PRECISION = 2;
const EQUAL_DEFAULT_WEIGHT = parseUnits('1', WEIGHT_PRECISION);

export interface IGaugeVoterVoteDialogParams {
    /**
     * The gauges to vote on.
     */
    gauges: IGauge[];
    /**
     * Gauge voter plugin address.
     */
    pluginAddress: string;
    /**
     * Network of the plugin.
     */
    network: Network;
    /**
     * User's total voting power for the epoch.
     */
    totalVotingPower: number;
    /**
     * Token symbol for voting power display.
     */
    tokenSymbol?: string;
    /**
     * User's existing votes per gauge (for prepopulation).
     */
    gaugeVotes: Array<{
        /**
         * Address of the gauge.
         */
        gaugeAddress: string;
        /**
         * Weight applied to the gauge.
         */
        votes: bigint;
        /**
         * Weight applied to the gauge, formatted.
         */
        formattedVotes: string;
    }>;
    /**
     * Callback called when a gauge is removed from the vote list.
     */
    onRemoveGauge?: (gaugeAddress: string) => void;
    /**
     * Callback called after successful vote transaction.
     */
    onSuccess?: () => void;
}

export interface IGaugeVoterVoteDialogProps
    extends IDialogComponentProps<IGaugeVoterVoteDialogParams> {}

export const GaugeVoterVoteDialog: React.FC<IGaugeVoterVoteDialogProps> = (
    props,
) => {
    const { location } = props;
    const { t } = useTranslations();

    invariant(
        location.params != null,
        'GaugeVoterVoteDialog: required parameters must be set.',
    );

    const {
        gauges,
        totalVotingPower,
        tokenSymbol,
        onRemoveGauge,
        onSuccess,
        pluginAddress,
        network,
        gaugeVotes,
    } = location.params;

    const { open, close } = useDialogContext();

    const [voteAllocations, setVoteAllocations] = useState<
        IGaugeVoteAllocation[]
    >(
        gauges.map((gauge) => {
            const existingVote = gaugeVotes.find(
                (gv) => gv.gaugeAddress === gauge.address,
            );
            const existingVotesValue = existingVote?.votes ?? BigInt(0);

            const existingPercentage =
                existingVotesValue > 0 && totalVotingPower > 0
                    ? (Number(existingVotesValue) / totalVotingPower) * 100
                    : 0;

            const initialWeight =
                existingPercentage > 0
                    ? parseUnits(
                          Math.round(existingPercentage).toString(),
                          WEIGHT_PRECISION,
                      )
                    : EQUAL_DEFAULT_WEIGHT;

            return {
                gauge,
                weight: initialWeight,
            };
        }),
    );

    const totalWeight = useMemo(
        () =>
            voteAllocations.reduce(
                (sum, allocation) => sum + allocation.weight,
                BigInt(0),
            ),
        [voteAllocations],
    );

    const handleUpdateWeight = (gaugeAddress: string, newWeight: bigint) => {
        setVoteAllocations((prev) =>
            prev.map((allocation) =>
                allocation.gauge.address === gaugeAddress
                    ? {
                          ...allocation,
                          weight: newWeight < BigInt(0) ? BigInt(0) : newWeight,
                      }
                    : allocation,
            ),
        );
    };

    const handleRemoveGauge = (gaugeAddress: string) => {
        setVoteAllocations((prev) =>
            prev.filter(
                (allocation) => allocation.gauge.address !== gaugeAddress,
            ),
        );
        onRemoveGauge?.(gaugeAddress);
    };

    useEffect(() => {
        if (voteAllocations.length === 0) {
            close(GaugeVoterPluginDialogId.VOTE_GAUGES);
        }
    }, [voteAllocations.length, close]);

    const handleEqualize = () => {
        setVoteAllocations((prev) =>
            prev.map((allocation) => ({
                ...allocation,
                weight: EQUAL_DEFAULT_WEIGHT,
            })),
        );
    };

    const resetAllocation = () => {
        setVoteAllocations((prev) =>
            prev.map((allocation) => ({ ...allocation, weight: BigInt(0) })),
        );
    };

    const canSubmit = useMemo(
        () =>
            totalWeight > BigInt(0) &&
            voteAllocations.length > 0 &&
            totalVotingPower > 0,
        [totalWeight, voteAllocations.length, totalVotingPower],
    );

    const handleSubmit = () => {
        const votes: IGaugeVote[] = voteAllocations
            .filter((allocation) => allocation.weight > BigInt(0))
            .map((allocation) => ({
                weight: allocation.weight,
                gauge: allocation.gauge.address,
            }));

        const transactionParams: IGaugeVoterVoteTransactionDialogParams = {
            votes,
            pluginAddress,
            network,
            onSuccess,
        };

        open(GaugeVoterPluginDialogId.VOTE_GAUGES_TRANSACTION, {
            params: transactionParams,
        });

        close(GaugeVoterPluginDialogId.VOTE_GAUGES);
    };

    const formattedTotalVotingPower = useMemo(
        () =>
            formatterUtils.formatNumber(totalVotingPower, {
                format: NumberFormat.TOKEN_AMOUNT_SHORT,
            }) ?? '0',
        [totalVotingPower],
    );

    return (
        <>
            <Dialog.Header
                description={t(
                    'app.plugins.gaugeVoter.gaugeVoterVoteDialog.content.description',
                )}
                onClose={close}
                title={t('app.plugins.gaugeVoter.gaugeVoterVoteDialog.title')}
            />
            <Dialog.Content className="flex flex-col gap-6 py-6">
                <GaugeVoterVoteDialogContent
                    onRemoveGauge={handleRemoveGauge}
                    onUpdateWeight={handleUpdateWeight}
                    tokenSymbol={tokenSymbol}
                    totalVotingPower={totalVotingPower}
                    voteAllocations={voteAllocations}
                />
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    onClick: handleSubmit,
                    label: t(
                        'app.plugins.gaugeVoter.gaugeVoterVoteDialog.action.submit',
                    ),
                    disabled: !canSubmit,
                }}
                secondaryAction={{
                    onClick: () => close(),
                    label: t(
                        'app.plugins.gaugeVoter.gaugeVoterVoteDialog.action.cancel',
                    ),
                }}
            >
                <GaugeVoterVoteDialogFooter
                    onEqualize={handleEqualize}
                    onReset={resetAllocation}
                    tokenSymbol={tokenSymbol}
                    totalVotingPower={formattedTotalVotingPower}
                />
            </Dialog.Footer>
        </>
    );
};
