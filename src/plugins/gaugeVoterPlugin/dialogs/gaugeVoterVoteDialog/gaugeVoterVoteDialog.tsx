'use client';

import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import {
    addressUtils,
    Avatar,
    Button,
    DataList,
    Dialog,
    formatterUtils,
    IconType,
    InputNumber,
    invariant,
    NumberFormat,
} from '@aragon/gov-ui-kit';
import { useMemo, useState } from 'react';
import type { IGauge } from '../../api/gaugeVoterService/domain';
import { GaugeVoterPluginDialogId } from '../../constants/gaugeVoterPluginDialogId';
import type { IGaugeVote, IGaugeVoterVoteTransactionDialogParams } from '../gaugeVoterVoteTransactionDialog';

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
     * Callback called when a gauge is removed from the vote list.
     */
    onRemoveGauge?: (gaugeAddress: string) => void;
}

export interface IGaugeVoterVoteDialogProps extends IDialogComponentProps<IGaugeVoterVoteDialogParams> {}

interface IGaugeVoteAllocation {
    gauge: IGauge;
    percentage: number;
}

export const GaugeVoterVoteDialog: React.FC<IGaugeVoterVoteDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'GaugeVoterVoteDialog: required parameters must be set.');

    const { gauges, pluginAddress, network, onRemoveGauge } = location.params;

    const { open, close } = useDialogContext();

    // Calculate total user voting power (existing votes + new epoch rewards)
    const existingVotes = useMemo(() => gauges.reduce((sum, gauge) => sum + gauge.userVotes, 0), [gauges]);
    const newEpochRewards = 15000; // TODO: Get from separate endpoint later
    const totalVotingPower = existingVotes + newEpochRewards;

    const [voteAllocations, setVoteAllocations] = useState<IGaugeVoteAllocation[]>(
        gauges.map((gauge) => ({ gauge, percentage: 0 })),
    );

    const totalPercentageUsed = useMemo(
        () => voteAllocations.reduce((sum, allocation) => sum + allocation.percentage, 0),
        [voteAllocations],
    );

    const updateVotePercentage = (gaugeAddress: string, newPercentage: number) => {
        setVoteAllocations((prev) =>
            prev.map((allocation) =>
                allocation.gauge.address === gaugeAddress
                    ? { ...allocation, percentage: Math.max(0, Math.min(100, newPercentage)) }
                    : allocation,
            ),
        );
    };

    const removeGauge = (gaugeAddress: string) => {
        setVoteAllocations((prev) => {
            const updated = prev.filter((allocation) => allocation.gauge.address !== gaugeAddress);

            // Close dialog if no gauges remain
            if (updated.length === 0) {
                close();
            }

            return updated;
        });
        onRemoveGauge?.(gaugeAddress);
    };

    const distributeEvenly = () => {
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

        const params: IGaugeVoterVoteTransactionDialogParams = {
            votes,
            pluginAddress,
            network,
        };
        open(GaugeVoterPluginDialogId.VOTE_GAUGES_TRANSACTION, { params });
        close(GaugeVoterPluginDialogId.VOTE_GAUGES);
    };

    return (
        <>
            <Dialog.Header title="Vote" onClose={close} />
            <Dialog.Content className="flex flex-col gap-6 py-6">
                <p className="text-sm text-neutral-600">
                    Proportionally distribute your voting power approach across your selected gauges.
                </p>
                <div className="flex flex-col gap-4">
                    {voteAllocations.map((allocation) => (
                        <DataList.Item
                            key={allocation.gauge.address}
                            className="bg-neutral-0 flex items-center gap-4 rounded-xl border border-neutral-100 p-4"
                        >
                            <div className="flex flex-1 items-center gap-3">
                                <Avatar
                                    src={allocation.gauge.logo}
                                    size="md"
                                    responsiveSize={{ md: 'lg' }}
                                    alt={allocation.gauge.name}
                                />
                                <div className="flex flex-col">
                                    <span className="text-base font-semibold text-neutral-800">
                                        {allocation.gauge.name}
                                    </span>
                                    <span className="text-sm text-neutral-500">
                                        {addressUtils.truncateAddress(allocation.gauge.address)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {allocation.percentage > 0 && (
                                    <span className="text-sm font-semibold text-neutral-500">
                                        {formatterUtils.formatNumber((allocation.percentage / 100) * totalVotingPower, {
                                            format: NumberFormat.TOKEN_AMOUNT_SHORT,
                                        })}{' '}
                                        ARG
                                    </span>
                                )}
                                <InputNumber
                                    min={0}
                                    max={100}
                                    suffix="%"
                                    value={allocation.percentage.toString()}
                                    className="max-w-40"
                                    onChange={(value) => updateVotePercentage(allocation.gauge.address, Number(value))}
                                />

                                <Button
                                    iconLeft={IconType.CLOSE}
                                    onClick={() => removeGauge(allocation.gauge.address)}
                                    variant="tertiary"
                                    size="sm"
                                />
                            </div>
                        </DataList.Item>
                    ))}
                </div>
                <div className="flex items-center justify-between gap-x-6">
                    <div className="flex grow items-center gap-x-6">
                        <span className="text-sm font-semibold text-neutral-800 uppercase">YOUR VOTES</span>
                        <div className="flex items-center gap-x-3">
                            <div className="flex items-center gap-x-2">
                                <Avatar
                                    size="sm"
                                    responsiveSize={{ md: 'sm' }}
                                    alt="Token logo"
                                    src="https://pbs.twimg.com/profile_images/1851934141782331394/Z0ZqlyIo_400x400.png"
                                />
                                <span className="text-base font-semibold text-neutral-800">
                                    {totalVotingPower.toString()} ARG
                                </span>
                            </div>
                            <div className="flex items-center gap-x-1 text-lg">
                                {totalPercentageUsed}%<span className="text-base text-neutral-500"> used</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" size="md" onClick={distributeEvenly} className="w-fit">
                            Distribute evenly
                        </Button>
                        <Button variant="tertiary" size="md" onClick={resetAllocation} className="w-fit">
                            Reset
                        </Button>
                    </div>
                </div>
            </Dialog.Content>

            <Dialog.Footer
                primaryAction={{ onClick: handleSubmit, label: 'Submit votes', disabled: !canSubmit }}
                secondaryAction={{ onClick: () => close(), label: 'Cancel' }}
            />
        </>
    );
};
