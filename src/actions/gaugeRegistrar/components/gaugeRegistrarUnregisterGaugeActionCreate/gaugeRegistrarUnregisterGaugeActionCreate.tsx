'use client';

import { type IProposalAction } from '@/modules/governance/api/governanceService';
import {
    type IProposalActionData,
    useCreateProposalFormContext,
} from '@/modules/governance/components/createProposalForm';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { CardEmptyState, IconType, invariant, type IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import { useCallback, useEffect, useState } from 'react';
import { encodeFunctionData, type Hex } from 'viem';
import { unregisterGaugeAbi } from '../../constants/gaugeRegistrarAbi';
import { GaugeRegistrarDialogId } from '../../constants/gaugeRegistrarDialogId';
import type { IGaugeRegistrarSelectGaugeDialogParams } from '../../dialogs/gaugeRegistrarSelectGaugeDialog';
import { GaugeRegistrarActionType } from '../../types/enum/gaugeRegistrarActionType';
import type { IRegisteredGauge } from '../../types/gaugeRegistrar';
import type { IGaugeRegistrarActionUnregisterGauge } from '../../types/gaugeRegistrarActionUnregisterGauge';
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

    const { addPrepareAction } = useCreateProposalFormContext<IGaugeRegistrarActionUnregisterGauge>();

    const handleOpenGaugeSelectDialog = () => {
        const params: IGaugeRegistrarSelectGaugeDialogParams = {
            dao: dao!,
            pluginAddress: action.to,
            onGaugeSelected: setSelectedGauge,
        };

        open(GaugeRegistrarDialogId.SELECT_GAUGE, { params });
    };

    const prepareAction = useCallback(() => {
        invariant(selectedGauge != null, 'GaugeRegistrarUnregisterGaugeActionCreate: gauge to remove not selected.');

        const data = encodeFunctionData({
            abi: [unregisterGaugeAbi],
            args: [selectedGauge.qiToken as Hex, selectedGauge.incentive, selectedGauge.rewardController as Hex],
        });

        return Promise.resolve(data);
    }, [selectedGauge]);

    useEffect(() => {
        addPrepareAction(GaugeRegistrarActionType.UNREGISTER_GAUGE, prepareAction);
    }, [addPrepareAction, prepareAction]);

    if (selectedGauge) {
        return <GaugeRegistrarGaugeListItem gauge={selectedGauge} onRemove={() => setSelectedGauge(undefined)} />;
    }

    return (
        <CardEmptyState
            heading={t('app.actions.gaugeRegistrar.gaugeRegistrarUnregisterGaugeActionCreate.emptyCard.heading')}
            description={t(
                'app.actions.gaugeRegistrar.gaugeRegistrarUnregisterGaugeActionCreate.emptyCard.description',
            )}
            objectIllustration={{ object: 'SETTINGS' }}
            secondaryButton={{
                label: t('app.actions.gaugeRegistrar.gaugeRegistrarUnregisterGaugeActionCreate.emptyCard.action'),
                onClick: handleOpenGaugeSelectDialog,
                iconLeft: IconType.PLUS,
            }}
            isStacked={false}
            className="border border-neutral-100"
        />
    );
};
