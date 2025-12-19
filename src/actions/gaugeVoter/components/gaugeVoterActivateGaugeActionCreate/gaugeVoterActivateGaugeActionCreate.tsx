'use client';

import { AlertInline, CardEmptyState, IconType, type IProposalActionComponentProps, invariant } from '@aragon/gov-ui-kit';
import { useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { encodeFunctionData } from 'viem';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import { type IProposalActionData, useCreateProposalFormContext } from '@/modules/governance/components/createProposalForm';
import type { IGauge } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { activateGaugeAbi } from '../../constants/addressGaugeVoterAbi';
import { GaugeVoterDialogId } from '../../constants/gaugeVoterDialogId';
import type { IGaugeVoterSelectGaugeDialogParams } from '../../dialogs/gaugeVoterSelectGaugeDialog';
import { GaugeVoterActionType } from '../../types/enum/gaugeVoterActionType';
import type { IGaugeVoterActionActivateGauge } from '../../types/gaugeVoterActionActivateGauge';
import { GaugeVoterGaugeListItem } from '../gaugeVoterGaugeListItem';

export interface IGaugeVoterActivateGaugeActionCreateProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction, unknown>> {}

export const GaugeVoterActivateGaugeActionCreate: React.FC<IGaugeVoterActivateGaugeActionCreateProps> = (props) => {
    const { action, index } = props;
    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { setValue } = useFormContext();

    const { data: dao } = useDao({ urlParams: { id: action.daoId } });

    // We use form to keep the state, so we can prevent wizard progressing if action state is invalid.
    const actionFieldName = `actions.[${index.toString()}]`;
    const selectedGaugeFieldName = `${actionFieldName}.gaugeToActivate`;

    const setSelectedGauge = (gauge?: IGauge) => {
        setValue(selectedGaugeFieldName, gauge);
    };

    const { value: selectedGauge, alert } = useFormField<Record<string, IGauge | undefined>, string>(selectedGaugeFieldName, {
        label: t('app.actions.gaugeVoter.gaugeVoterActivateGaugeActionCreate.emptyCard.heading'),
        rules: {
            required: true,
        },
    });

    const { addPrepareAction } = useCreateProposalFormContext<IGaugeVoterActionActivateGauge>();

    const handleOpenGaugeSelectDialog = () => {
        const params: IGaugeVoterSelectGaugeDialogParams = {
            dao: dao!,
            pluginAddress: action.to,
            onGaugeSelected: setSelectedGauge,
            status: 'inactive',
        };

        open(GaugeVoterDialogId.SELECT_GAUGE, { params });
    };

    const prepareAction = useCallback((action: IGaugeVoterActionActivateGauge) => {
        invariant(action.gaugeToActivate != null, 'GaugeVoterActivateGaugeActionCreate: gauge to activate not selected.');

        const data = encodeFunctionData({
            abi: [activateGaugeAbi],
            functionName: 'activateGauge',
            args: [action.gaugeToActivate.address],
        });

        return Promise.resolve(data);
    }, []);

    useEffect(() => {
        addPrepareAction(GaugeVoterActionType.ACTIVATE_GAUGE, prepareAction);
    }, [addPrepareAction, prepareAction]);

    if (selectedGauge) {
        return <GaugeVoterGaugeListItem gauge={selectedGauge} onRemove={() => setSelectedGauge(undefined)} />;
    }

    return (
        <>
            <CardEmptyState
                className="border border-neutral-100"
                description={t('app.actions.gaugeVoter.gaugeVoterActivateGaugeActionCreate.emptyCard.description')}
                heading={t('app.actions.gaugeVoter.gaugeVoterActivateGaugeActionCreate.emptyCard.heading')}
                isStacked={false}
                objectIllustration={{ object: 'SETTINGS' }}
                secondaryButton={{
                    label: t('app.actions.gaugeVoter.gaugeVoterActivateGaugeActionCreate.emptyCard.action'),
                    onClick: handleOpenGaugeSelectDialog,
                    iconLeft: IconType.PLUS,
                }}
            />
            {alert && <AlertInline message={alert.message} variant={alert.variant} />}
        </>
    );
};
