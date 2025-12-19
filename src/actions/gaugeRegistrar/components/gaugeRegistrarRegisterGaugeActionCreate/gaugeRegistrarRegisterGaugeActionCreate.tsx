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
import { usePinFile, usePinJson } from '@/shared/api/ipfsService/mutations';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { gaugeRegistrarAbi } from '../../constants/gaugeRegistrarAbi';
import { GaugeRegistrarActionType } from '../../types/enum/gaugeRegistrarActionType';
import type { IGaugeRegistrarActionRegisterGauge } from '../../types/gaugeRegistrarActionRegisterGauge';
import { GaugeRegistrarRegisterGaugeActionCreateForm } from './gaugeRegistrarRegisterGaugeActionCreateForm';

export interface IGaugeRegistrarRegisterGaugeActionCreateProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction, unknown>
    > {}

export const GaugeRegistrarRegisterGaugeActionCreate: React.FC<
    IGaugeRegistrarRegisterGaugeActionCreateProps
> = (props) => {
    const { index, chainId } = props;

    const { mutateAsync: pinJsonAsync } = usePinJson();
    const { mutateAsync: pinFileAsync } = usePinFile();
    const { addPrepareAction } =
        useCreateProposalFormContext<IGaugeRegistrarActionRegisterGauge>();

    const fieldName = `actions.[${index.toString()}]`;

    const prepareAction = useCallback(
        async (action: IGaugeRegistrarActionRegisterGauge) => {
            invariant(
                action.gaugeDetails != null,
                'GaugeRegistrarRegisterGaugeAction: gaugeDetails expected to be initialized by the register gauge form.',
            );

            const {
                name,
                description,
                resources,
                avatar,
                rewardControllerAddress,
                qiTokenAddress,
                incentiveType,
            } = action.gaugeDetails;
            const proposedMetadata = { name, description, links: resources };
            let daoAvatar: string | undefined;

            if (avatar?.file != null) {
                const avatarResult = await pinFileAsync({ body: avatar.file });
                daoAvatar = ipfsUtils.cidToUri(avatarResult.IpfsHash);
            }

            const metadata = daoAvatar
                ? { ...proposedMetadata, avatar: daoAvatar }
                : proposedMetadata;

            const ipfsResult = await pinJsonAsync({ body: metadata });
            const hexResult = transactionUtils.stringToMetadataHex(
                ipfsResult.IpfsHash,
            );

            invariant(
                incentiveType != null,
                'Incentive type not properly set.',
            );

            const data = encodeFunctionData({
                abi: gaugeRegistrarAbi,
                functionName: 'registerGauge',
                args: [
                    qiTokenAddress?.address as Hex,
                    incentiveType,
                    rewardControllerAddress?.address as Hex,
                    hexResult,
                ],
            });

            return data;
        },
        [pinFileAsync, pinJsonAsync],
    );

    useEffect(() => {
        addPrepareAction(
            GaugeRegistrarActionType.REGISTER_GAUGE,
            prepareAction,
        );
    }, [addPrepareAction, prepareAction]);

    return (
        <GaugeRegistrarRegisterGaugeActionCreateForm
            chainId={chainId}
            fieldPrefix={`${fieldName}.gaugeDetails`}
        />
    );
};
