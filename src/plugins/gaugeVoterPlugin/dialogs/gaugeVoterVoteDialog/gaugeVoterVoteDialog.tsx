'use client';

import { Dialog, formatterUtils, invariant, NumberFormat } from '@aragon/gov-ui-kit';
import { useEffect, useMemo, useState } from 'react';
import type { Network } from '@/shared/api/daoService';
import { type IDialogComponentProps, useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IGauge } from '../../api/gaugeVoterService/domain';
import { GaugeVoterPluginDialogId } from '../../constants/gaugeVoterPluginDialogId';
import type { IGaugeVote, IGaugeVoterVoteTransactionDialogParams } from '../gaugeVoterVoteTransactionDialog';
import { GaugeVoterVoteDialogContent, type IGaugeVoteAllocation } from './gaugeVoterVoteDialogContent';
import { GaugeVoterVoteDialogFooter } from './gaugeVoterVoteDialogFooter';

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

export interface IGaugeVoterVoteDialogProps extends IDialogComponentProps<IGaugeVoterVoteDialogParams> {}

export const GaugeVoterVoteDialog: React.FC<IGaugeVoterVoteDialogProps> = (props) => {
    const { location } = props;
    const { t } = useTranslations();

    invariant(location.params != null, 'GaugeVoterVoteDialog: required parameters must be set.');

    const { gauges, totalVotingPower, tokenSymbol, onRemoveGauge, onSuccess, pluginAddress, network, gaugeVotes } = location.params;

    const { open, close } = useDialogContext();

    const [voteAllocations, setVoteAllocations] = useState<IGaugeVoteAllocation[]>(
        gauges.map((gauge) => {
            // Find existing votes for this gauge
            const existingVote = gaugeVotes.find((gv) => gv.gaugeAddress === gauge.address);
            const existingVotesValue = existingVote?.votes ?? BigInt(0);

            // Calculate percentage from existing votes
            const existingPercentage =
                existingVotesValue > 0 && totalVotingPower > 0 ? (Number(existingVotesValue) / totalVotingPower) * 100 : 0;

            return {
                gauge,
                percentage: Math.round(existingPercentage), // Round to whole number
                existingVotes: existingVotesValue,
                formattedExistingVotes: existingVote?.formattedVotes ?? '0',
            };
        })
    );

    const totalPercentageUsed = useMemo(
        () => voteAllocations.reduce((sum, allocation) => sum + allocation.percentage, 0),
        [voteAllocations]
    );

    const [hasModified, setHasModified] = useState(false);

    const handleUpdateVotePercentage = (gaugeAddress: string, newPercentage: number) => {
        setHasModified(true);
        setVoteAllocations((prev) =>
            prev.map((allocation) =>
                allocation.gauge.address === gaugeAddress
                    ? { ...allocation, percentage: Math.max(0, Math.min(100, newPercentage)) }
                    : allocation
            )
        );
    };

    const handleRemoveGauge = (gaugeAddress: string) => {
        setVoteAllocations((prev) => prev.filter((allocation) => allocation.gauge.address !== gaugeAddress));
        onRemoveGauge?.(gaugeAddress);
    };

    // Close dialog when all gauges are removed
    useEffect(() => {
        if (voteAllocations.length === 0) {
            close(GaugeVoterPluginDialogId.VOTE_GAUGES);
        }
    }, [voteAllocations.length, close]);

    const handleEqualize = () => {
        setHasModified(true);
        const evenPercentage = Math.floor(100 / voteAllocations.length);
        const remainder = 100 - evenPercentage * voteAllocations.length;

        setVoteAllocations((prev) =>
            prev.map((allocation, index) => ({
                ...allocation,
                percentage: index === 0 ? evenPercentage + remainder : evenPercentage,
            }))
        );
    };

    const resetAllocation = () => {
        setHasModified(true);
        setVoteAllocations((prev) => prev.map((allocation) => ({ ...allocation, percentage: 0 })));
    };

    const canSubmit = useMemo(
        () => totalPercentageUsed > 0 && totalPercentageUsed === 100 && voteAllocations.length > 0 && totalVotingPower > 0,
        [totalPercentageUsed, voteAllocations.length, totalVotingPower]
    );

    const handleSubmit = () => {
        const votes: IGaugeVote[] = voteAllocations
            .filter((allocation) => allocation.percentage > 0)
            .map((allocation) => ({
                weight: BigInt(allocation.percentage),
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
        () => formatterUtils.formatNumber(totalVotingPower, { format: NumberFormat.TOKEN_AMOUNT_SHORT }) ?? '0',
        [totalVotingPower]
    );

    return (
        <>
            <Dialog.Header
                description={t('app.plugins.gaugeVoter.gaugeVoterVoteDialog.content.description')}
                onClose={close}
                title={t('app.plugins.gaugeVoter.gaugeVoterVoteDialog.title')}
            />
            <Dialog.Content className="flex flex-col gap-6 py-6">
                <GaugeVoterVoteDialogContent
                    hasModified={hasModified}
                    onRemoveGauge={handleRemoveGauge}
                    onUpdatePercentage={handleUpdateVotePercentage}
                    tokenSymbol={tokenSymbol}
                    totalVotingPower={totalVotingPower}
                    voteAllocations={voteAllocations}
                />
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    onClick: handleSubmit,
                    label: t('app.plugins.gaugeVoter.gaugeVoterVoteDialog.action.submit'),
                    disabled: !canSubmit,
                }}
                secondaryAction={{
                    onClick: () => close(),
                    label: t('app.plugins.gaugeVoter.gaugeVoterVoteDialog.action.cancel'),
                }}
            >
                <GaugeVoterVoteDialogFooter
                    onEqualize={handleEqualize}
                    onReset={resetAllocation}
                    tokenSymbol={tokenSymbol}
                    totalPercentageUsed={totalPercentageUsed}
                    totalVotingPower={formattedTotalVotingPower}
                />
            </Dialog.Footer>
        </>
    );
};
