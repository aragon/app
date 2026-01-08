import type { IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import { useCallback, useEffect } from 'react';
import { encodeFunctionData } from 'viem';
import {
    CreateDaoForm,
    type ICreateDaoFormMetadataData,
} from '@/modules/createDao/components/createDaoForm';
import {
    type IProposalActionUpdateMetadata,
    ProposalActionType,
} from '@/modules/governance/api/governanceService';
import { setMetadataAbi } from '@/modules/governance/constants/setMetadataAbi';
import { usePinJson } from '@/shared/api/ipfsService/mutations';
import { usePinFile } from '@/shared/api/ipfsService/mutations/usePinFile';
import { useFormField } from '@/shared/hooks/useFormField';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import type {
    IIpfsMetadata,
    IProposalActionData,
} from '../../../createProposalFormDefinitions';
import { useCreateProposalFormContext } from '../../../createProposalFormProvider';

export interface IUpdateDaoMetadataAction
    extends Omit<IProposalActionUpdateMetadata, 'proposedMetadata' | 'data'> {
    /**
     * Metadata proposed on the action.
     */
    proposedMetadata: ICreateDaoFormMetadataData;
    /**
     * The encoded transaction data (populated by background pinning).
     */
    data?: string;
    /**
     * IPFS metadata for the action (optional).
     * Contains pinning state and encoded transaction data.
     */
    ipfsMetadata?: IIpfsMetadata;
}

export interface IUpdateDaoMetadaActionProps
    extends IProposalActionComponentProps<IProposalActionData> {}

export const UpdateDaoMetadataAction: React.FC<IUpdateDaoMetadaActionProps> = (
    props,
) => {
    const { index } = props;

    const { mutateAsync: pinJsonAsync } = usePinJson();
    const { mutateAsync: pinFileAsync } = usePinFile();
    const { addPrepareAction } = useCreateProposalFormContext<
        IUpdateDaoMetadataAction & { data: string }
    >();

    const fieldName = `actions.[${index.toString()}]`;
    useFormField<Record<string, IProposalActionData>, typeof fieldName>(
        fieldName,
    );

    const prepareAction = useCallback(
        async (action: IUpdateDaoMetadataAction) => {
            if (
                action.data &&
                action.data !== '0x' &&
                action.ipfsMetadata?.pinnedData
            ) {
                return action.ipfsMetadata.pinnedData;
            }

            const { name, description, resources, avatar } =
                action.proposedMetadata;
            const proposedMetadata = { name, description, links: resources };

            let daoAvatar: string | undefined;

            if (avatar?.file != null) {
                // Pin the avatar set on the form when the file property is set, meaning that the user changed the gauge avatar
                const avatarResult = await pinFileAsync({ body: avatar.file });
                daoAvatar = ipfsUtils.cidToUri(avatarResult.IpfsHash);
            } else if (avatar?.url) {
                daoAvatar = ipfsUtils.srcToUri(avatar.url);
            }

            const metadata = daoAvatar
                ? { ...proposedMetadata, avatar: daoAvatar }
                : proposedMetadata;

            const ipfsResult = await pinJsonAsync({ body: metadata });
            const hexResult = transactionUtils.stringToMetadataHex(
                ipfsResult.IpfsHash,
            );
            const data = encodeFunctionData({
                abi: [setMetadataAbi],
                args: [hexResult],
            });

            return data;
        },
        [pinFileAsync, pinJsonAsync],
    );

    useEffect(() => {
        addPrepareAction(ProposalActionType.METADATA_UPDATE, prepareAction);
    }, [addPrepareAction, prepareAction]);

    return (
        <CreateDaoForm.Metadata fieldPrefix={`${fieldName}.proposedMetadata`} />
    );
};
