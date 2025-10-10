'use client';

import type { Network } from '@/shared/api/daoService';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
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
     * User's total voting power for the epoch.
     */
    totalVotingPower: number;
    /**
     * Token symbol for voting power display.
     */
    tokenSymbol: string;
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
    const { t } = useTranslations();

    invariant(location.params != null, 'GaugeVoterVoteDialog: required parameters must be set.');

    const { gauges, totalVotingPower, tokenSymbol, onRemoveGauge, pluginAddress, network } = location.params;

    const { open, close } = useDialogContext();

    const [voteAllocations, setVoteAllocations] = useState<IGaugeVoteAllocation[]>(
        gauges.map((gauge) => {
            const existingPercentage =
                gauge.userVotes > 0 && totalVotingPower > 0 ? (gauge.userVotes / totalVotingPower) * 100 : 0;

            return {
                gauge,
                percentage: Math.round(existingPercentage), // Round to whole number
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
        setVoteAllocations((prev) => {
            const updated = prev.filter((allocation) => allocation.gauge.address !== gaugeAddress);

            if (updated.length === 0) {
                close();
            }

            return updated;
        });
        onRemoveGauge?.(gaugeAddress);
    };

    const distributeEvenly = () => {
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

    return (
        <>
            <Dialog.Header title={t('app.plugins.gaugeVoter.gaugeVoterVoteDialog.title')} onClose={close} />
            <Dialog.Content className="flex flex-col gap-6 py-6">
                <p className="text-sm text-neutral-600">
                    {t('app.plugins.gaugeVoter.gaugeVoterVoteDialog.content.description')}
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
                                        {!hasModified && allocation.gauge.userVotes > 0
                                            ? // Show exact user votes if unmodified
                                              formatterUtils.formatNumber(allocation.gauge.userVotes, {
                                                  format: NumberFormat.TOKEN_AMOUNT_SHORT,
                                              })
                                            : // Calculate from percentage once modified
                                              formatterUtils.formatNumber(
                                                  (allocation.percentage / 100) * totalVotingPower,
                                                  {
                                                      format: NumberFormat.TOKEN_AMOUNT_SHORT,
                                                  },
                                              )}{' '}
                                        {tokenSymbol}
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
                <div className="flex items-center justify-between gap-x-6">
                    <div className="flex grow items-center gap-x-6">
                        <span className="text-sm font-semibold text-neutral-800 uppercase">
                            {t('app.plugins.gaugeVoter.gaugeVoterVoteDialog.footer.yourVotes')}
                        </span>
                        <div className="flex items-center gap-x-3">
                            <div className="flex items-center gap-x-2">
                                <Avatar
                                    size="sm"
                                    responsiveSize={{ md: 'sm' }}
                                    alt="Token logo"
                                    src="https://pbs.twimg.com/profile_images/1851934141782331394/Z0ZqlyIo_400x400.png"
                                />
                                <span className="text-base font-semibold text-neutral-800">
                                    {totalVotingPower.toString()} {tokenSymbol}
                                </span>
                            </div>
                            <div className="flex items-center gap-x-1 text-lg">
                                {totalPercentageUsed}%
                                <span className="text-base text-neutral-500">
                                    {' '}
                                    {t('app.plugins.gaugeVoter.gaugeVoterVoteDialog.content.used')}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" size="md" onClick={distributeEvenly} className="w-fit">
                            {t('app.plugins.gaugeVoter.gaugeVoterVoteDialog.action.distributeEvenly')}
                        </Button>
                        <Button variant="tertiary" size="md" onClick={resetAllocation} className="w-fit">
                            {t('app.plugins.gaugeVoter.gaugeVoterVoteDialog.action.reset')}
                        </Button>
                    </div>
                </div>
            </Dialog.Footer>
        </>
    );
};
