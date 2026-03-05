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
import type { ICampaign } from '@/plugins/capitalDistributorPlugin/api/capitalDistributorService';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { endCampaignAbi } from '../../constants/addressCapitalDistributorAbi';
import { CapitalDistributorDialogId } from '../../constants/capitalDistributorDialogId';
import type { ICapitalDistributorSelectCampaignDialogParams } from '../../dialogs/capitalDistributorSelectCampaignDialog';
import type { ICapitalDistributorActionEndCampaign } from '../../types/capitalDistributorActionEndCampaign';
import { CapitalDistributorActionType } from '../../types/enum/capitalDistributorActionType';
import { CapitalDistributorCampaignListItem } from '../capitalDistributorCampaignListItem';

export interface ICapitalDistributorEndCampaignActionCreateProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction, unknown>
    > {}

export const CapitalDistributorEndCampaignActionCreate: React.FC<
    ICapitalDistributorEndCampaignActionCreateProps
> = (props) => {
    const { action, index } = props;
    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { setValue, resetField } = useFormContext();

    const { data: dao } = useDao({ urlParams: { id: action.daoId } });

    // We use form to keep the state, so we can prevent wizard progressing if action state is invalid.
    const actionFieldName = `actions.[${index.toString()}]`;
    const selectedCampaignFieldName = `${actionFieldName}.campaignToEnd`;

    const setSelectedCampaign = (campaign?: ICampaign) => {
        if (!campaign) {
            resetField(selectedCampaignFieldName);
            return;
        }

        setValue(selectedCampaignFieldName, campaign);
    };

    const { value: selectedCampaign, alert } = useFormField<
        Record<string, ICampaign | undefined>,
        string
    >(selectedCampaignFieldName, {
        label: t(
            'app.actions.capitalDistributor.capitalDistributorEndCampaignActionCreate.emptyCard.heading',
        ),
        rules: {
            required: true,
        },
    });

    const { addPrepareAction } =
        useCreateProposalFormContext<ICapitalDistributorActionEndCampaign>();

    const handleOpenSelectDialog = () => {
        invariant(
            dao != null,
            'CapitalDistributorEndCampaignActionCreate: DAO not loaded.',
        );
        const params: ICapitalDistributorSelectCampaignDialogParams = {
            dao,
            pluginAddress: action.to,
            onCampaignSelected: setSelectedCampaign,
            activityStatus: 'active',
        };

        open(CapitalDistributorDialogId.SELECT_CAMPAIGN, { params });
    };

    const prepareAction = useCallback(
        (action: ICapitalDistributorActionEndCampaign) => {
            invariant(
                action.campaignToEnd != null,
                'CapitalDistributorEndCampaignActionCreate: campaign to end not selected.',
            );

            const data = encodeFunctionData({
                abi: [endCampaignAbi],
                functionName: 'endCampaign',
                args: [BigInt(action.campaignToEnd.campaignId)],
            });

            return Promise.resolve(data);
        },
        [],
    );

    useEffect(() => {
        addPrepareAction(
            CapitalDistributorActionType.END_CAMPAIGN,
            prepareAction,
        );
    }, [addPrepareAction, prepareAction]);

    if (selectedCampaign) {
        return (
            <CapitalDistributorCampaignListItem
                campaign={selectedCampaign}
                onRemove={() => setSelectedCampaign(undefined)}
            />
        );
    }

    return (
        <>
            <CardEmptyState
                className="border border-neutral-100"
                description={t(
                    'app.actions.capitalDistributor.capitalDistributorEndCampaignActionCreate.emptyCard.description',
                )}
                heading={t(
                    'app.actions.capitalDistributor.capitalDistributorEndCampaignActionCreate.emptyCard.heading',
                )}
                isStacked={false}
                objectIllustration={{ object: 'SETTINGS' }}
                secondaryButton={{
                    label: t(
                        'app.actions.capitalDistributor.capitalDistributorEndCampaignActionCreate.emptyCard.action',
                    ),
                    onClick: handleOpenSelectDialog,
                    iconLeft: IconType.PLUS,
                }}
            />
            {alert && (
                <AlertInline message={alert.message} variant={alert.variant} />
            )}
        </>
    );
};
