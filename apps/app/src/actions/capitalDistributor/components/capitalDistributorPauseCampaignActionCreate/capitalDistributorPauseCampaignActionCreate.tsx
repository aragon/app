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
import { pauseCampaignAbi } from '../../constants/addressCapitalDistributorAbi';
import { CapitalDistributorDialogId } from '../../constants/capitalDistributorDialogId';
import type { ICapitalDistributorSelectCampaignDialogParams } from '../../dialogs/capitalDistributorSelectCampaignDialog';
import type { ICapitalDistributorActionPauseCampaign } from '../../types/capitalDistributorActionPauseCampaign';
import { CapitalDistributorActionType } from '../../types/enum/capitalDistributorActionType';
import { CapitalDistributorCampaignListItem } from '../capitalDistributorCampaignListItem';

export interface ICapitalDistributorPauseCampaignActionCreateProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction, unknown>
    > {}

export const CapitalDistributorPauseCampaignActionCreate: React.FC<
    ICapitalDistributorPauseCampaignActionCreateProps
> = (props) => {
    const { action, index } = props;
    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { setValue, resetField } = useFormContext();

    const { data: dao } = useDao({ urlParams: { id: action.daoId } });

    // We use form to keep the state, so we can prevent wizard progressing if action state is invalid.
    const actionFieldName = `actions.[${index.toString()}]`;
    const selectedCampaignFieldName = `${actionFieldName}.campaignToPause`;

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
            'app.actions.capitalDistributor.capitalDistributorPauseCampaignActionCreate.emptyCard.heading',
        ),
        rules: {
            required: true,
        },
    });

    const { addPrepareAction } =
        useCreateProposalFormContext<ICapitalDistributorActionPauseCampaign>();

    const handleOpenSelectDialog = () => {
        invariant(
            dao != null,
            'CapitalDistributorPauseCampaignActionCreate: DAO not loaded.',
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
        (action: ICapitalDistributorActionPauseCampaign) => {
            invariant(
                action.campaignToPause != null,
                'CapitalDistributorPauseCampaignActionCreate: campaign to pause not selected.',
            );

            const data = encodeFunctionData({
                abi: [pauseCampaignAbi],
                functionName: 'pauseCampaign',
                args: [BigInt(action.campaignToPause.campaignId)],
            });

            return Promise.resolve(data);
        },
        [],
    );

    useEffect(() => {
        addPrepareAction(
            CapitalDistributorActionType.PAUSE_CAMPAIGN,
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
                    'app.actions.capitalDistributor.capitalDistributorPauseCampaignActionCreate.emptyCard.description',
                )}
                heading={t(
                    'app.actions.capitalDistributor.capitalDistributorPauseCampaignActionCreate.emptyCard.heading',
                )}
                isStacked={false}
                objectIllustration={{ object: 'SETTINGS' }}
                secondaryButton={{
                    label: t(
                        'app.actions.capitalDistributor.capitalDistributorPauseCampaignActionCreate.emptyCard.action',
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
