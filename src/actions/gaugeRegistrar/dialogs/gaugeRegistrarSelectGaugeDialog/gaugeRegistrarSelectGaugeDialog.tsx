'use client';

import { type IDao, PluginInterfaceType } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { DataList, Dialog, invariant, StateSkeletonBar, StateSkeletonCircular } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { GaugeRegistrarGaugeListItem } from '../../components/gaugeRegistrarGaugeListItem';
import { useGaugeRegistrarGauges } from '../../hooks/useGaugeRegistrarGauges';
import type { IRegisteredGauge } from '../../types/gaugeRegistrar';

export interface IGaugeRegistrarSelectGaugeDialogParams {
    /**
     * Address of the gauge registrar plugin contract.
     */
    pluginAddress: string;
    /**
     * DAO to update gauges for.
     */
    dao: IDao;
    /**
     * Callback called when a gauge is selected.
     */
    onGaugeSelected?: (gauge: IRegisteredGauge) => void;
}

export interface IGaugeRegistrarSelectGaugeDialogProps
    extends IDialogComponentProps<IGaugeRegistrarSelectGaugeDialogParams> {}

export const GaugeRegistrarSelectGaugeDialog: React.FC<IGaugeRegistrarSelectGaugeDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'GaugeRegistrarSelectGaugeDialog: params must be defined');

    const { pluginAddress, dao, onGaugeSelected } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const [plugin] = useDaoPlugins({ daoId: dao.id, interfaceType: PluginInterfaceType.GAUGE_REGISTRAR }) ?? [];
    const { data: gauges, isLoading } = useGaugeRegistrarGauges({
        pluginAddress,
        network: dao.network,
        gaugeVoterAddress: 'plugin.meta.address',
    });

    const [selectedGauge, setSelectedGauge] = useState<IRegisteredGauge | null>(null);

    const handleSubmit = () => {
        if (selectedGauge != null) {
            onGaugeSelected?.(selectedGauge);
        }
        close();
    };

    return (
        <>
            <Dialog.Header
                onClose={close}
                title={t('app.actions.gaugeRegistrar.gaugeRegistrarSelectGaugeDialog.title')}
            />
            <Dialog.Content description={t('app.actions.gaugeRegistrar.gaugeRegistrarSelectGaugeDialog.description')}>
                <div className="flex w-full flex-col gap-3 py-2 md:gap-2">
                    {isLoading && (
                        <DataList.Root
                            entityLabel={t('app.actions.gaugeRegistrar.gaugeRegistrarSelectGaugeDialog.entityLabel')}
                        >
                            {Array.from({ length: 3 }).map((_, index) => (
                                <DataList.Item
                                    key={index}
                                    tabIndex={0}
                                    aria-busy="true"
                                    aria-label="loading"
                                    className="flex items-center gap-4 px-4 py-3 md:p-6"
                                >
                                    <StateSkeletonCircular size="lg" />
                                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                                        <StateSkeletonBar size="lg" width="75%" />
                                        <StateSkeletonBar size="sm" width="50%" />
                                    </div>
                                </DataList.Item>
                            ))}
                        </DataList.Root>
                    )}
                    {!isLoading && gauges != null && gauges.length > 0 && (
                        <DataList.Root
                            entityLabel={t('app.actions.gaugeRegistrar.gaugeRegistrarSelectGaugeDialog.entityLabel')}
                        >
                            {gauges.map((gauge: IRegisteredGauge) => (
                                <GaugeRegistrarGaugeListItem
                                    key={gauge.gaugeAddress}
                                    gauge={gauge}
                                    isActive={selectedGauge?.gaugeAddress === gauge.gaugeAddress}
                                    onClick={() => setSelectedGauge(gauge)}
                                />
                            ))}
                        </DataList.Root>
                    )}
                    {!isLoading && (gauges == null || gauges.length === 0) && (
                        <div className="flex items-center justify-center py-8 text-neutral-500">
                            {t('app.actions.gaugeRegistrar.gaugeRegistrarSelectGaugeDialog.emptyState')}
                        </div>
                    )}
                </div>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t('app.actions.gaugeRegistrar.gaugeRegistrarSelectGaugeDialog.submit'),
                    onClick: handleSubmit,
                    disabled: selectedGauge == null,
                }}
                secondaryAction={{
                    label: t('app.actions.gaugeRegistrar.gaugeRegistrarSelectGaugeDialog.cancel'),
                    onClick: () => close(),
                }}
            />
        </>
    );
};
