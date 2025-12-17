'use client';

import { AlertInline, CardEmptyState, IconType, type IProposalActionComponentProps, invariant } from '@aragon/gov-ui-kit';
import { useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { encodeFunctionData, type Hex } from 'viem';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import { type IProposalActionData, useCreateProposalFormContext } from '@/modules/governance/components/createProposalForm';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { gaugeRegistrarAbi } from '../../constants/gaugeRegistrarAbi';
import { GaugeRegistrarDialogId } from '../../constants/gaugeRegistrarDialogId';
import type { IGaugeRegistrarSelectGaugeDialogParams } from '../../dialogs/gaugeRegistrarSelectGaugeDialog';
import { GaugeRegistrarActionType } from '../../types/enum/gaugeRegistrarActionType';
import type { IRegisteredGauge } from '../../types/gaugeRegistrar';
import type { IGaugeRegistrarActionUnregisterGauge } from '../../types/gaugeRegistrarActionUnregisterGauge';
import { GaugeRegistrarActiveVotingAlert } from '../gaugeRegistrarActiveVotingAlert';
import { GaugeRegistrarGaugeListItem } from '../gaugeRegistrarGaugeListItem';

export interface IGaugeRegistrarUnregisterGaugeActionCreateProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction, unknown>> {}

export const GaugeRegistrarUnregisterGaugeActionCreate: React.FC<IGaugeRegistrarUnregisterGaugeActionCreateProps> = (props) => {
    const { action, index } = props;
    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { setValue } = useFormContext();

    const { data: dao } = useDao({ urlParams: { id: action.daoId } });

    // We use form to keep the state, so we can prevent wizard progressing if action state is invalid.
    const actionFieldName = `actions.[${index.toString()}]`;
    const selectedGaugeFieldName = `${actionFieldName}.gaugeToRemove`;

    const setSelectedGauge = (gauge?: IRegisteredGauge) => {
        setValue(selectedGaugeFieldName, gauge);
    };

    const { value: selectedGauge, alert } = useFormField<Record<string, IRegisteredGauge | undefined>, string>(selectedGaugeFieldName, {
        label: t('app.actions.gaugeRegistrar.gaugeRegistrarUnregisterGaugeActionCreate.emptyCard.heading'),
        rules: {
            required: true,
        },
    });

    const { addPrepareAction } = useCreateProposalFormContext<IGaugeRegistrarActionUnregisterGauge>();

    const handleOpenGaugeSelectDialog = () => {
        const params: IGaugeRegistrarSelectGaugeDialogParams = {
            dao: dao!,
            pluginAddress: action.to,
            onGaugeSelected: setSelectedGauge,
        };

        open(GaugeRegistrarDialogId.SELECT_GAUGE, { params });
    };

    const prepareAction = useCallback((action: IGaugeRegistrarActionUnregisterGauge) => {
        invariant(action.gaugeToRemove != null, 'GaugeRegistrarUnregisterGaugeActionCreate: gauge to remove not selected.');

        const data = encodeFunctionData({
            abi: gaugeRegistrarAbi,
            functionName: 'unregisterGauge',
            args: [action.gaugeToRemove.qiToken as Hex, action.gaugeToRemove.incentive, action.gaugeToRemove.rewardController as Hex],
        });

        return Promise.resolve(data);
    }, []);

    useEffect(() => {
        addPrepareAction(GaugeRegistrarActionType.UNREGISTER_GAUGE, prepareAction);
    }, [addPrepareAction, prepareAction]);

    if (selectedGauge) {
        return (
            <>
                <GaugeRegistrarGaugeListItem gauge={selectedGauge} onRemove={() => setSelectedGauge(undefined)} />
                <GaugeRegistrarActiveVotingAlert />
            </>
        );
    }

    return (
        <>
            <CardEmptyState
                className="border border-neutral-100"
                description={t('app.actions.gaugeRegistrar.gaugeRegistrarUnregisterGaugeActionCreate.emptyCard.description')}
                heading={t('app.actions.gaugeRegistrar.gaugeRegistrarUnregisterGaugeActionCreate.emptyCard.heading')}
                isStacked={false}
                objectIllustration={{ object: 'SETTINGS' }}
                secondaryButton={{
                    label: t('app.actions.gaugeRegistrar.gaugeRegistrarUnregisterGaugeActionCreate.emptyCard.action'),
                    onClick: handleOpenGaugeSelectDialog,
                    iconLeft: IconType.PLUS,
                }}
            />
            {alert && <AlertInline message={alert.message} variant={alert.variant} />}
        </>
    );
};
