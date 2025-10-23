'use client';

import { type IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { type IProposalActionComponentProps, CardEmptyState, IconType } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { GaugeRegistrarDialogId } from '../../constants/gaugeRegistrarDialogId';
import type { IGaugeRegistrarSelectGaugeDialogParams } from '../../dialogs/gaugeRegistrarSelectGaugeDialog';
import type { IRegisteredGauge } from '../../types/gaugeRegistrar';
import { GaugeRegistrarGaugeListItem } from '../gaugeRegistrarGaugeListItem';

export interface IGaugeRegistrarUnregisterGaugeActionCreateProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction, unknown>> {}

export const GaugeRegistrarUnregisterGaugeActionCreate: React.FC<IGaugeRegistrarUnregisterGaugeActionCreateProps> = (
    props,
) => {
    const { action } = props;
    const { t } = useTranslations();
    const { open } = useDialogContext();
    const [selectedGauge, setSelectedGauge] = useState<IRegisteredGauge>();
    const { data: dao } = useDao({ urlParams: { id: action.daoId } });

    const handleOpenGaugeSelectDialog = () => {
        const params: IGaugeRegistrarSelectGaugeDialogParams = {
            dao: dao!,
            pluginAddress: action.to,
            onGaugeSelected: setSelectedGauge,
        };

        open(GaugeRegistrarDialogId.SELECT_GAUGE, { params });
    };

    if (selectedGauge) {
        return <GaugeRegistrarGaugeListItem gauge={selectedGauge} onRemove={() => setSelectedGauge(undefined)} />;
    }

    return (
        <CardEmptyState
            heading={t('app.actions.gaugeRegistrar.gaugeRegistrarUnregisterGaugeAction.emptyCard.heading')}
            description={t('app.actions.gaugeRegistrar.gaugeRegistrarUnregisterGaugeAction.emptyCard.description')}
            objectIllustration={{ object: 'SETTINGS' }}
            secondaryButton={{
                label: t('app.actions.gaugeRegistrar.gaugeRegistrarUnregisterGaugeAction.emptyCard.action'),
                onClick: handleOpenGaugeSelectDialog,
                iconLeft: IconType.PLUS,
            }}
            isStacked={false}
            className="border border-neutral-100"
        />
    );
};
