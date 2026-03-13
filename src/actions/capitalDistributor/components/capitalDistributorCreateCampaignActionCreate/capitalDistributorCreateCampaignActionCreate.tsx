'use client';

import {
    type IProposalAction,
    type IProposalActionComponentProps,
    invariant,
} from '@aragon/gov-ui-kit';
import { useCallback, useEffect } from 'react';
import {
    encodeAbiParameters,
    encodeFunctionData,
    type Hex,
    zeroHash,
} from 'viem';
import { CapitalFlowDaoSlotId } from '@/modules/capitalFlow/constants/moduleDaoSlots';
import {
    type IProposalActionData,
    useCreateProposalFormContext,
} from '@/modules/governance/components/createProposalForm';
import { usePinJson } from '@/shared/api/ipfsService/mutations';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { createCampaignAbi } from '../../constants/addressCapitalDistributorAbi';
import { veLockEncoderActionId } from '../../constants/veLockEncoderActionId';
import type { ICapitalDistributorActionCreateCampaign } from '../../types/capitalDistributorActionCreateCampaign';
import { CapitalDistributorActionType } from '../../types/enum/capitalDistributorActionType';
import { capitalDistributorCampaignScheduleUtils } from '../../utils/capitalDistributorCampaignScheduleUtils';
import {
    CampaignPayoutType,
    CapitalDistributorCreateCampaignActionCreateForm,
} from './capitalDistributorCreateCampaignActionCreateForm';

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

    const escrowAddress = useSlotSingleFunction<void, Hex | undefined>({
        slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_VOTING_ESCROW_ADDRESS,
        pluginId: daoId,
        params: undefined,
    });

    const fieldName = `actions.[${index.toString()}]`;

    const prepareAction = useCallback(
        async (action: ICapitalDistributorActionCreateCampaign) => {
            invariant(
                action.campaignDetails != null,
                'CapitalDistributorCreateCampaignActionCreate: campaignDetails expected to be initialized by the create campaign form.',
            );

            const {
                asset,
                title,
                description,
                resources,
                merkleTreeInfo,
                payoutType,
            } = action.campaignDetails;

            const { startTime: startTimeSeconds, endTime: endTimeSeconds } =
                capitalDistributorCampaignScheduleUtils.parseScheduleSettings(
                    action.campaignDetails,
                );

            let actionEncoderId: Hex;
            let actionEncoderInitData: Hex;

            if (payoutType === CampaignPayoutType.VE_LOCK_ENCODER) {
                invariant(
                    escrowAddress != null,
                    'Voting escrow address not found.',
                );
                actionEncoderId = veLockEncoderActionId;
                actionEncoderInitData = encodeAbiParameters(
                    [{ name: '_votingEscrowAddress', type: 'address' }],
                    [escrowAddress],
                );
            } else {
                actionEncoderId = zeroHash;
                actionEncoderInitData = '0x';
            }

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
                        actionEncoderId,
                        actionEncoderInitData,
                    },
                    {
                        // _settings
                        startTime: startTimeSeconds,
                        endTime: endTimeSeconds,
                    },
                ],
            });

            return data;
        },
        [escrowAddress, pinJsonAsync],
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
