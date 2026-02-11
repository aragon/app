'use client';

import {
    type IProposalAction,
    type IProposalActionComponentProps,
    invariant,
} from '@aragon/gov-ui-kit';
import { useCallback, useEffect } from 'react';
import { encodeFunctionData, type Hex } from 'viem';
import {
    type IProposalActionData,
    useCreateProposalFormContext,
} from '@/modules/governance/components/createProposalForm';
import { usePinJson } from '@/shared/api/ipfsService/mutations';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { createCampaignAbi } from '../../constants/addressCapitalDistributorAbi';
import type { ICapitalDistributorActionCreateCampaign } from '../../types/capitalDistributorActionCreateCampaign';
import { CapitalDistributorActionType } from '../../types/enum/capitalDistributorActionType';
import { CapitalDistributorCreateCampaignActionCreateForm } from './capitalDistributorCreateCampaignActionCreateForm';

export interface ICapitalDistributorCreateCampaignActionCreateProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction, unknown>
    > {}

export const CapitalDistributorCreateCampaignActionCreate: React.FC<
    ICapitalDistributorCreateCampaignActionCreateProps
> = (props) => {
    const { index, action } = props;
    const { daoId } = action;

    invariant(
        daoId != null,
        'CapitalDistributorCreateCampaignActionCreate: DAO ID not properly set.',
    );

    const { mutateAsync: pinJsonAsync } = usePinJson();
    const { addPrepareAction } =
        useCreateProposalFormContext<ICapitalDistributorActionCreateCampaign>();

    const fieldName = `actions.[${index.toString()}]`;

    const prepareAction = useCallback(
        async (action: ICapitalDistributorActionCreateCampaign) => {
            invariant(
                action.campaignDetails != null,
                'CapitalDistributorCreateCampaignAction: campaignDetails expected to be initialized by the create campaign form.',
            );

            const { asset, title, description, resources } =
                action.campaignDetails;

            // Pin campaign metadata to IPFS
            const proposedMetadata = {
                title,
                description,
                links: resources,
            };
            const metadataIpfsResult = await pinJsonAsync({
                body: proposedMetadata,
            });
            const metadataHexResult = transactionUtils.stringToMetadataHex(
                metadataIpfsResult.IpfsHash,
            );

            const data = encodeFunctionData({
                abi: [createCampaignAbi],
                functionName: 'createCampaign',
                args: [
                    metadataHexResult,
                    'campaignConfig.strategyId' as Hex,
                    { factory: '0x12344', params: '0x12344' },
                    '0x',
                    asset?.token.address as Hex,
                    'campaignConfig.actionEncoder' as Hex,
                    '0xcampaignConfig.actionEncoderInitializationAuxData',
                    false,
                    BigInt(0),
                    BigInt(0),
                ],
            });

            return data;
        },
        [pinJsonAsync],
    );

    useEffect(() => {
        addPrepareAction(
            CapitalDistributorActionType.CREATE_CAMPAIGN,
            prepareAction,
        );
    }, [addPrepareAction, prepareAction]);

    return (
        <CapitalDistributorCreateCampaignActionCreateForm
            daoId={daoId}
            fieldPrefix={`${fieldName}.campaignDetails`}
        />
    );
};
