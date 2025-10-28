'use client';

import type { Network } from '@/shared/api/daoService';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Dialog, formatterUtils, invariant, NumberFormat } from '@aragon/gov-ui-kit';
import { useEffect, useMemo, useState } from 'react';
import type { IGaugeReturn } from '../../api/gaugeVoterService/domain';
import { GaugeVoterPluginDialogId } from '../../constants/gaugeVoterPluginDialogId';
import type { IGaugeVote, IGaugeVoterVoteTransactionDialogParams } from '../gaugeVoterVoteTransactionDialog';
import { GaugeVoterVoteDialogContent, type IGaugeVoteAllocation } from './gaugeVoterVoteDialogContent';
import { GaugeVoterVoteDialogFooter } from './gaugeVoterVoteDialogFooter';

export interface IGaugeVoterVoteDialogParams {
    /**
     * The gauges to vote on.
     */
    gauges: IGaugeReturn[];
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
        gaugeAddress: string;
        votes: bigint;
        formattedVotes: string;
    }>;
    /**
     * Callback called when a gauge is removed from the vote list.
     */
    onRemoveGauge?: (gaugeAddress: string) => void;
}

export interface IGaugeVoterVoteDialogProps extends IDialogComponentProps<IGaugeVoterVoteDialogParams> {}

export const GaugeVoterVoteDialog: React.FC<IGaugeVoterVoteDialogProps> = (props) => {
    const { location } = props;
    const { t } = useTranslations();

    invariant(location.params != null, 'GaugeVoterVoteDialog: required parameters must be set.');

    const { gauges, totalVotingPower, tokenSymbol, onRemoveGauge, pluginAddress, network, gaugeVotes } =
        location.params;

    const { open, close } = useDialogContext();

    const [voteAllocations, setVoteAllocations] = useState<IGaugeVoteAllocation[]>(
        gauges.map((gauge) => {
            // Find existing votes for this gauge
            const existingVote = gaugeVotes.find((gv) => gv.gaugeAddress === gauge.address);
            const existingVotesBigInt = existingVote?.votes ?? BigInt(0);

            // Calculate percentage from existing votes
            const existingPercentage =
                existingVotesBigInt > 0 && totalVotingPower > 0
                    ? (Number(existingVotesBigInt) / totalVotingPower) * 100
                    : 0;

            return {
                gauge,
                percentage: Math.round(existingPercentage), // Round to whole number
                existingVotes: existingVotesBigInt,
                formattedExistingVotes: existingVote?.formattedVotes ?? '0',
            };
        }),
    );

    const totalPercentageUsed = useMemo(
        () => voteAllocations.reduce((sum, allocation) => sum + allocation.percentage, 0),
        [voteAllocations],
    );

    const [hasModified, setHasModified] = useState(false);

    const updateVotePercentage = (gaugeAddress: string, newPercentage: number) => {
        setHasModified(true);
        setVoteAllocations((prev) =>
            prev.map((allocation) =>
                allocation.gauge.address === gaugeAddress
                    ? { ...allocation, percentage: Math.max(0, Math.min(100, newPercentage)) }
                    : allocation,
            ),
        );
    };

    const removeGauge = (gaugeAddress: string) => {
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
            })),
        );
    };

    const resetAllocation = () => {
        setHasModified(true);
        setVoteAllocations((prev) => prev.map((allocation) => ({ ...allocation, percentage: 0 })));
    };

    const canSubmit = useMemo(() => {
        return totalPercentageUsed > 0 && totalPercentageUsed === 100 && voteAllocations.length > 0;
    }, [totalPercentageUsed, voteAllocations.length]);

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
        };

        open(GaugeVoterPluginDialogId.VOTE_GAUGES_TRANSACTION, {
            params: transactionParams,
        });

        close(GaugeVoterPluginDialogId.VOTE_GAUGES);
    };

    const formattedTotalVotingPower = useMemo(
        () => formatterUtils.formatNumber(totalVotingPower, { format: NumberFormat.TOKEN_AMOUNT_SHORT }) ?? '0',
        [totalVotingPower],
    );

    return (
        <>
            <Dialog.Header
                title={t('app.plugins.gaugeVoter.gaugeVoterVoteDialog.title')}
                onClose={close}
                description={t('app.plugins.gaugeVoter.gaugeVoterVoteDialog.content.description')}
            />
            <Dialog.Content className="flex flex-col gap-6 py-6">
                <GaugeVoterVoteDialogContent
                    voteAllocations={voteAllocations}
                    totalVotingPower={totalVotingPower}
                    tokenSymbol={tokenSymbol}
                    hasModified={hasModified}
                    onUpdatePercentage={updateVotePercentage}
                    onRemoveGauge={removeGauge}
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
                    totalVotingPower={formattedTotalVotingPower}
                    tokenSymbol={tokenSymbol}
                    totalPercentageUsed={totalPercentageUsed}
                    onEqualize={handleEqualize}
                    onReset={resetAllocation}
                />
            </Dialog.Footer>
        </>
    );
};
