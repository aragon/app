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
import { gaugeVoterAbi } from '../../constants/addressGaugeVoterAbi';
import { GaugeVoterActionType } from '../../types/enum/gaugeVoterActionType';
import type { IGaugeVoterActionCreateGauge } from '../../types/gaugeVoterActionCreateGauge';
import { GaugeVoterCreateGaugeActionCreateForm } from './gaugeVoterCreateGaugeActionCreateForm';

export interface IGaugeVoterCreateGaugeActionCreateProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction, unknown>
    > {}

export const GaugeVoterCreateGaugeActionCreate: React.FC<
    IGaugeVoterCreateGaugeActionCreateProps
> = (props) => {
    const { index, chainId } = props;

    const { mutateAsync: pinJsonAsync } = usePinJson();
    const { mutateAsync: pinFileAsync } = usePinFile();
    const { addPrepareAction } =
        useCreateProposalFormContext<IGaugeVoterActionCreateGauge>();

    const fieldName = `actions.[${index.toString()}]`;

    const prepareAction = useCallback(
        async (action: IGaugeVoterActionCreateGauge) => {
            invariant(
                action.gaugeDetails != null,
                'GaugeVoterCreateGaugeAction: gaugeDetails expected to be initialized by the create gauge form.',
            );

            const { name, description, resources, avatar, gaugeAddress } =
                action.gaugeDetails;
            const proposedMetadata = { name, description, links: resources };
            let gaugeAvatar: string | undefined;

            if (avatar?.file != null) {
                const avatarResult = await pinFileAsync({ body: avatar.file });
                gaugeAvatar = ipfsUtils.cidToUri(avatarResult.IpfsHash);
            }

            const metadata = gaugeAvatar
                ? { ...proposedMetadata, avatar: gaugeAvatar }
                : proposedMetadata;

            const ipfsResult = await pinJsonAsync({ body: metadata });
            const ipfsHexResult = transactionUtils.stringToMetadataHex(
                ipfsResult.IpfsHash,
            );

            invariant(
                gaugeAddress?.address != null,
                'Gauge address not properly set.',
            );

            const data = encodeFunctionData({
                abi: gaugeVoterAbi,
                functionName: 'createGauge',
                args: [gaugeAddress.address as Hex, ipfsHexResult],
            });

            return data;
        },
        [pinFileAsync, pinJsonAsync],
    );

    useEffect(() => {
        addPrepareAction(GaugeVoterActionType.CREATE_GAUGE, prepareAction);
    }, [addPrepareAction, prepareAction]);

    return (
        <GaugeVoterCreateGaugeActionCreateForm
            chainId={chainId}
            fieldPrefix={`${fieldName}.gaugeDetails`}
        />
    );
};
