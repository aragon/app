'use client';

import {
    type IProposalActionData,
    useCreateProposalFormContext,
} from '@/modules/governance/components/createProposalForm';
import { usePinFile, usePinJson } from '@/shared/api/ipfsService/mutations';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { invariant, type IProposalAction, type IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import { useCallback, useEffect } from 'react';
import { encodeFunctionData, type Hex } from 'viem';
import { registerGaugeAbi } from '../../constants/gaugeRegistrarAbi';
import { GaugeIncentiveType } from '../../types/enum/gaugeIncentiveType';
import { GaugeRegistrarActionType } from '../../types/enum/gaugeRegistrarActionType';
import type { IGaugeRegistrarActionRegisterGauge } from '../../types/gaugeRegistrarActionRegisterGauge';
import { GaugeRegistrarRegisterGaugeActionCreateForm } from './gaugeRegistrarRegisterGaugeActionCreateForm';

export interface IGaugeRegistrarRegisterGaugeActionCreateProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction, unknown>> {}

export const GaugeRegistrarRegisterGaugeActionCreate: React.FC<IGaugeRegistrarRegisterGaugeActionCreateProps> = (
    props,
) => {
    const { index } = props;

    const { mutateAsync: pinJsonAsync } = usePinJson();
    const { mutateAsync: pinFileAsync } = usePinFile();
    const { addPrepareAction } = useCreateProposalFormContext<IGaugeRegistrarActionRegisterGauge>();

    const fieldName = `actions.[${index.toString()}]`;

    const prepareAction = useCallback(
        async (action: IGaugeRegistrarActionRegisterGauge) => {
            invariant(
                action.gaugeDetails != null,
                'GaugeRegistrarRegisterGaugeAction:gaugeDetails expected to be initialized',
            );

            const { name, description, resources, avatar, rewardControllerAddress, qiTokenAddress, incentiveType } =
                action.gaugeDetails;

            const proposedMetadata = { name, description, links: resources };
            let daoAvatar: string | undefined;

            if (avatar?.file != null) {
                // Pin the avatar set on the form when the file property is set, meaning that the user changed the DAO avatar
                const avatarResult = await pinFileAsync({ body: avatar.file });
                daoAvatar = ipfsUtils.cidToUri(avatarResult.IpfsHash);
            } else if (avatar?.url) {
                // Set previous avatar URL if user did not change the DAO avatar and DAO already has an avatar
                daoAvatar = ipfsUtils.srcToUri(avatar.url);
            }

            const metadata = daoAvatar ? { ...proposedMetadata, avatar: daoAvatar } : proposedMetadata;

            const ipfsResult = await pinJsonAsync({ body: metadata });
            const hexResult = transactionUtils.stringToMetadataHex(ipfsResult.IpfsHash);
            const data = encodeFunctionData({
                abi: [registerGaugeAbi],
                args: [
                    qiTokenAddress?.address as Hex,
                    incentiveType ?? GaugeIncentiveType.SUPPLY,
                    rewardControllerAddress?.address as Hex,
                    hexResult,
                ],
            });

            return data;
        },
        [pinFileAsync, pinJsonAsync],
    );

    useEffect(() => {
        addPrepareAction(GaugeRegistrarActionType.REGISTER_GAUGE, prepareAction);
    }, [addPrepareAction, prepareAction]);

    return <GaugeRegistrarRegisterGaugeActionCreateForm fieldPrefix={`${fieldName}.gaugeDetails`} />;
};
