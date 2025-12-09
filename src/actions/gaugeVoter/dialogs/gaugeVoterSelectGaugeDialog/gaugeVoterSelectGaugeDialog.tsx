'use client';

import type { IGauge } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService';
import { useAllGauges } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService';
import type { IDao } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DataList, Dialog, invariant } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { Hex } from 'viem';
import { GaugeVoterGaugeListItem, GaugeVoterGaugeListItemSkeleton } from '../../components/gaugeVoterGaugeListItem';

export interface IGaugeVoterSelectGaugeDialogParams {
    /**
     * Address of the gauge voter plugin contract.
     */
    pluginAddress: string;
    /**
     * DAO to select gauges for.
     */
    dao: IDao;
    /**
     * Optional filter to show only active or inactive gauges.
     */
    status?: 'active' | 'inactive';
    /**
     * Callback called when a gauge is selected.
     */
    onGaugeSelected?: (gauge: IGauge) => void;
}

export interface IGaugeVoterSelectGaugeDialogProps extends IDialogComponentProps<IGaugeVoterSelectGaugeDialogParams> {}

export const GaugeVoterSelectGaugeDialog: React.FC<IGaugeVoterSelectGaugeDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'GaugeVoterSelectGaugeDialog: params must be defined');

    const { pluginAddress, dao, status, onGaugeSelected } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const { data: gauges, isLoading } = useAllGauges({
        gaugeListParams: {
            urlParams: {
                pluginAddress: pluginAddress as Hex,
                network: dao.network,
            },
            queryParams: {
                status,
            },
        },
    });

    const [selectedGauge, setSelectedGauge] = useState<IGauge | null>(null);

    const handleSubmit = () => {
        if (selectedGauge != null) {
            onGaugeSelected?.(selectedGauge);
        }
        close();
    };

    return (
        <>
            <Dialog.Header onClose={close} title={t('app.actions.gaugeVoter.gaugeVoterSelectGaugeDialog.title')} />
            <Dialog.Content description={t('app.actions.gaugeVoter.gaugeVoterSelectGaugeDialog.description')}>
                <div className="flex w-full flex-col gap-3 py-2 md:gap-2">
                    {isLoading && (
                        <DataList.Root
                            entityLabel={t('app.actions.gaugeVoter.gaugeVoterSelectGaugeDialog.entityLabel')}
                        >
                            <GaugeVoterGaugeListItemSkeleton />
                            <GaugeVoterGaugeListItemSkeleton />
                            <GaugeVoterGaugeListItemSkeleton />
                        </DataList.Root>
                    )}
                    {!isLoading && gauges.length > 0 && (
                        <DataList.Root
                            entityLabel={t('app.actions.gaugeVoter.gaugeVoterSelectGaugeDialog.entityLabel')}
                        >
                            {gauges.map((gauge: IGauge) => (
                                <GaugeVoterGaugeListItem
                                    key={gauge.address}
                                    gauge={gauge}
                                    isActive={selectedGauge?.address === gauge.address}
                                    onClick={() => setSelectedGauge(gauge)}
                                />
                            ))}
                        </DataList.Root>
                    )}
                    {!isLoading && gauges.length === 0 && (
                        <div className="flex items-center justify-center py-8 text-neutral-500">
                            {t('app.actions.gaugeVoter.gaugeVoterSelectGaugeDialog.emptyState')}
                        </div>
                    )}
                </div>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t('app.actions.gaugeVoter.gaugeVoterSelectGaugeDialog.submit'),
                    onClick: handleSubmit,
                    disabled: selectedGauge == null,
                }}
                secondaryAction={{
                    label: t('app.actions.gaugeVoter.gaugeVoterSelectGaugeDialog.cancel'),
                    onClick: () => close(),
                }}
            />
        </>
    );
};
