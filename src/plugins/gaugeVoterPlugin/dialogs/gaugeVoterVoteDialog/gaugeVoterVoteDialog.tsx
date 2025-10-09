'use client';

import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { Avatar, Button, DataList, Dialog, Icon, IconType, InputNumber, invariant } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import type { IGauge } from '../../api/gaugeVoterService/domain';
import type { IGaugeVoterPlugin } from '../../types';

export interface IGaugeVoterVoteDialogParams {
    /**
     * The gauges to vote on.
     */
    gauges: IGauge[];
    /**
     * Gauge voter plugin instance.
     */
    plugin: IGaugeVoterPlugin;
    /**
     * Network of the plugin.
     */
    network: Network;
    /**
     * Callback called on dialog close.
     */
    close: () => void;
}

export interface IGaugeVoterVoteDialogProps extends IDialogComponentProps<IGaugeVoterVoteDialogParams> {}

interface IGaugeVoteAllocation {
    gauge: IGauge;
    percentage: number;
}

export const GaugeVoterVoteDialog: React.FC<IGaugeVoterVoteDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'GaugeVoterVoteDialog: required parameters must be set.');

    const { gauges, close } = location.params;

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

    const incrementVote = (gaugeAddress: string) => {
        const allocation = voteAllocations.find((a) => a.gauge.address === gaugeAddress);
        if (allocation && totalPercentageUsed < 100) {
            updateVotePercentage(gaugeAddress, allocation.percentage + 1);
        }
    };

    const decrementVote = (gaugeAddress: string) => {
        const allocation = voteAllocations.find((a) => a.gauge.address === gaugeAddress);
        if (allocation && allocation.percentage > 0) {
            updateVotePercentage(gaugeAddress, allocation.percentage - 1);
        }
    };

    const removeGauge = (gaugeAddress: string) => {
        setVoteAllocations((prev) => prev.filter((allocation) => allocation.gauge.address !== gaugeAddress));
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

    const reset = () => {
        setVoteAllocations((prev) => prev.map((allocation) => ({ ...allocation, percentage: 0 })));
    };

    const canSubmit = useMemo(() => {
        return totalPercentageUsed > 0 && totalPercentageUsed <= 100 && voteAllocations.length > 0;
    }, [totalPercentageUsed, voteAllocations.length]);

    const handleSubmit = () => {
        // TODO: Implement transaction logic using gaugeVoterTransactionUtils
        console.log('Submitting votes:', voteAllocations);
        close();
    };

    const truncateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
                                        {truncateAddress(allocation.gauge.address)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <InputNumber min={0} max={100} suffix="%" defaultValue={0} className="max-w-48" />

                                <Button iconLeft={IconType.CLOSE} onClick={close} variant="tertiary" size="sm" />
                            </div>
                        </DataList.Item>
                    ))}
                </div>

                {/* Voting Summary Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-neutral-500 uppercase">YOUR VOTES</span>
                        <div className="flex items-center gap-2">
                            <Avatar size="sm" responsiveSize={{ md: 'sm' }} alt="PDT" />
                            <span className="text-base font-semibold text-neutral-800">9.00M PDT</span>
                        </div>
                        <span
                            className={classNames(
                                'text-base font-semibold',
                                totalPercentageUsed > 100 ? 'text-critical-500' : 'text-neutral-600',
                            )}
                        >
                            {totalPercentageUsed}% used
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" size="md" onClick={distributeEvenly} className="w-fit">
                            Distribute evenly
                        </Button>
                        <Button variant="tertiary" size="md" onClick={reset} className="w-fit">
                            Reset
                        </Button>
                    </div>
                </div>

                {/* Error State */}
                {totalPercentageUsed > 100 && (
                    <div className="bg-critical-100 flex items-center gap-2 rounded-lg p-3">
                        <Icon icon={IconType.WARNING} className="text-critical-500" />
                        <span className="text-critical-800 text-sm">
                            Vote allocation exceeds 100%. Please adjust your votes.
                        </span>
                    </div>
                )}
            </Dialog.Content>

            <Dialog.Footer>
                <Button variant="tertiary" onClick={close}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit}>
                    Submit votes
                </Button>
            </Dialog.Footer>
        </>
    );
};
