'use client';

import {
    type IProposalAction,
    type IProposalActionComponentProps,
    invariant,
} from '@aragon/gov-ui-kit';
import { useCallback, useEffect } from 'react';
import { encodeFunctionData, type Hex, zeroHash } from 'viem';
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
                'CapitalDistributorCreateCampaignActionCreate: campaignDetails expected to be initialized by the create campaign form.',
            );

            const { asset, title, description, resources, merkleTreeInfo } =
                action.campaignDetails;

            // Pin campaign metadata to IPFS
            const proposedMetadata = {
                title,
                description,
                links: resources,
                type: 'Distribution',
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
                    metadataHexResult, // _metadataURI
                    {
                        // _strategy
                        strategyId:
                            '0x6d65726b6c652d6469737472696275746f722d73747261746567790000000000', // toBytes32("merkle-distributor-strategy")
                        strategyParams: '0x',
                        initData: merkleTreeInfo.merkleRoot as Hex,
                    },
                    {
                        // _payout
                        token: asset.token.address as Hex,
                        actionEncoderId: zeroHash,
                        actionEncoderInitData: '0x',
                    },
                    {
                        // _settings
                        startTime: BigInt(0),
                        endTime: BigInt(0),
                    },
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
