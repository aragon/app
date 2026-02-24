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
import { resumeCampaignAbi } from '../../constants/addressCapitalDistributorAbi';
import { CapitalDistributorDialogId } from '../../constants/capitalDistributorDialogId';
import type { ICapitalDistributorSelectCampaignDialogParams } from '../../dialogs/capitalDistributorSelectCampaignDialog';
import type { ICapitalDistributorActionResumeCampaign } from '../../types/capitalDistributorActionResumeCampaign';
import { CapitalDistributorActionType } from '../../types/enum/capitalDistributorActionType';
import { CapitalDistributorCampaignListItem } from '../capitalDistributorCampaignListItem';

export interface ICapitalDistributorResumeCampaignActionCreateProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction, unknown>
    > {}

export const CapitalDistributorResumeCampaignActionCreate: React.FC<
    ICapitalDistributorResumeCampaignActionCreateProps
> = (props) => {
    const { action, index } = props;
    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { setValue } = useFormContext();

    const { data: dao } = useDao({ urlParams: { id: action.daoId } });

    const actionFieldName = `actions.[${index.toString()}]`;
    const selectedCampaignFieldName = `${actionFieldName}.campaignToResume`;

    const setSelectedCampaign = (campaign?: ICampaign) => {
        setValue(selectedCampaignFieldName, campaign);
    };

    const { value: selectedCampaign, alert } = useFormField<
        Record<string, ICampaign | undefined>,
        string
    >(selectedCampaignFieldName, {
        label: t(
            'app.actions.capitalDistributor.capitalDistributorResumeCampaignActionCreate.emptyCard.heading',
        ),
        rules: {
            required: true,
        },
    });

    const { addPrepareAction } =
        useCreateProposalFormContext<ICapitalDistributorActionResumeCampaign>();

    const handleOpenSelectDialog = () => {
        invariant(
            dao != null,
            'CapitalDistributorResumeCampaignActionCreate: DAO not loaded.',
        );
        const params: ICapitalDistributorSelectCampaignDialogParams = {
            dao,
            pluginAddress: action.to,
            onCampaignSelected: setSelectedCampaign,
            activityStatus: 'inactive',
        };

        open(CapitalDistributorDialogId.SELECT_CAMPAIGN, { params });
    };

    const prepareAction = useCallback(
        (action: ICapitalDistributorActionResumeCampaign) => {
            invariant(
                action.campaignToResume != null,
                'CapitalDistributorResumeCampaignActionCreate: campaign to resume not selected.',
            );

            const data = encodeFunctionData({
                abi: [resumeCampaignAbi],
                functionName: 'resumeCampaign',
                args: [BigInt(action.campaignToResume.campaignId)],
            });

            return Promise.resolve(data);
        },
        [],
    );

    useEffect(() => {
        addPrepareAction(
            CapitalDistributorActionType.RESUME_CAMPAIGN,
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
                    'app.actions.capitalDistributor.capitalDistributorResumeCampaignActionCreate.emptyCard.description',
                )}
                heading={t(
                    'app.actions.capitalDistributor.capitalDistributorResumeCampaignActionCreate.emptyCard.heading',
                )}
                isStacked={false}
                objectIllustration={{ object: 'SETTINGS' }}
                secondaryButton={{
                    label: t(
                        'app.actions.capitalDistributor.capitalDistributorResumeCampaignActionCreate.emptyCard.action',
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
