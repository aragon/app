'use client';

import {
    AlertInline,
    CardEmptyState,
    IconType,
    type IProposalActionComponentProps,
    invariant,
} from '@aragon/gov-ui-kit';
import { useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { encodeFunctionData } from 'viem';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import {
    type IProposalActionData,
    useCreateProposalFormContext,
} from '@/modules/governance/components/createProposalForm';
import type { IGauge } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { gaugeVoterAbi } from '../../constants/addressGaugeVoterAbi';
import { GaugeVoterDialogId } from '../../constants/gaugeVoterDialogId';
import type { IGaugeVoterSelectGaugeDialogParams } from '../../dialogs/gaugeVoterSelectGaugeDialog';
import { GaugeVoterActionType } from '../../types/enum/gaugeVoterActionType';
import type { IGaugeVoterActionDeactivateGauge } from '../../types/gaugeVoterActionDeactivateGauge';
import { GaugeVoterGaugeListItem } from '../gaugeVoterGaugeListItem';

export interface IGaugeVoterDeactivateGaugeActionCreateProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction, unknown>
    > {}

export const GaugeVoterDeactivateGaugeActionCreate: React.FC<
    IGaugeVoterDeactivateGaugeActionCreateProps
> = (props) => {
    const { action, index } = props;
    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { setValue } = useFormContext();

    const { data: dao } = useDao({ urlParams: { id: action.daoId } });

    // We use form to keep the state, so we can prevent wizard progressing if action state is invalid.
    const actionFieldName = `actions.[${index.toString()}]`;
    const selectedGaugeFieldName = `${actionFieldName}.gaugeToDeactivate`;

    const setSelectedGauge = (gauge?: IGauge) => {
        setValue(selectedGaugeFieldName, gauge);
    };

    const { value: selectedGauge, alert } = useFormField<
        Record<string, IGauge | undefined>,
        string
    >(selectedGaugeFieldName, {
        label: t(
            'app.actions.gaugeVoter.gaugeVoterDeactivateGaugeActionCreate.emptyCard.heading',
        ),
        rules: {
            required: true,
        },
    });

    const { addPrepareAction } =
        useCreateProposalFormContext<IGaugeVoterActionDeactivateGauge>();

    const handleOpenGaugeSelectDialog = () => {
        const params: IGaugeVoterSelectGaugeDialogParams = {
            dao: dao!,
            pluginAddress: action.to,
            onGaugeSelected: setSelectedGauge,
            status: 'active',
        };

        open(GaugeVoterDialogId.SELECT_GAUGE, { params });
    };

    const prepareAction = useCallback(
        (action: IGaugeVoterActionDeactivateGauge) => {
            invariant(
                action.gaugeToDeactivate != null,
                'GaugeVoterDeactivateGaugeActionCreate: gauge to deactivate not selected.',
            );

            const data = encodeFunctionData({
                abi: gaugeVoterAbi,
                functionName: 'deactivateGauge',
                args: [action.gaugeToDeactivate.address],
            });

            return Promise.resolve(data);
        },
        [],
    );

    useEffect(() => {
        addPrepareAction(GaugeVoterActionType.DEACTIVATE_GAUGE, prepareAction);
    }, [addPrepareAction, prepareAction]);

    if (selectedGauge) {
        return (
            <GaugeVoterGaugeListItem
                gauge={selectedGauge}
                onRemove={() => setSelectedGauge(undefined)}
            />
        );
    }

    return (
        <>
            <CardEmptyState
                className="border border-neutral-100"
                description={t(
                    'app.actions.gaugeVoter.gaugeVoterDeactivateGaugeActionCreate.emptyCard.description',
                )}
                heading={t(
                    'app.actions.gaugeVoter.gaugeVoterDeactivateGaugeActionCreate.emptyCard.heading',
                )}
                isStacked={false}
                objectIllustration={{ object: 'SETTINGS' }}
                secondaryButton={{
                    label: t(
                        'app.actions.gaugeVoter.gaugeVoterDeactivateGaugeActionCreate.emptyCard.action',
                    ),
                    onClick: handleOpenGaugeSelectDialog,
                    iconLeft: IconType.PLUS,
                }}
            />
            {alert && (
                <AlertInline message={alert.message} variant={alert.variant} />
            )}
        </>
    );
};
