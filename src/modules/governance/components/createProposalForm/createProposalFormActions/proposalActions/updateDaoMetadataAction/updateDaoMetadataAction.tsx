import { CreateDaoForm, type ICreateDaoFormMetadataData } from '@/modules/createDao/components/createDaoForm';
import { ProposalActionType, type IProposalActionUpdateMetadata } from '@/modules/governance/api/governanceService';
import type { IProposalCreateAction } from '@/modules/governance/dialogs/publishProposalDialog';
import { usePinJson } from '@/shared/api/ipfsService/mutations';
import { usePinFile } from '@/shared/api/ipfsService/mutations/usePinFile';
import { useFormField } from '@/shared/hooks/useFormField';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import type { IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import { useCallback, useEffect } from 'react';
import { encodeFunctionData } from 'viem';
import type { IProposalActionData } from '../../../createProposalFormDefinitions';
import { useCreateProposalFormContext } from '../../../createProposalFormProvider';

export interface IUpdateDaoMetadataAction extends Omit<IProposalActionUpdateMetadata, 'proposedMetadata'> {
    /**
     * Metadata proposed on the action.
     */
    proposedMetadata: ICreateDaoFormMetadataData;
}

export interface IUpdateDaoMetadaActionProps extends IProposalActionComponentProps<IProposalActionData> {}

const setMetadataAbi = {
    type: 'function',
    inputs: [{ name: '_metadata', internalType: 'bytes', type: 'bytes' }],
    name: 'setMetadata',
    outputs: [],
    stateMutability: 'nonpayable',
};

export const UpdateDaoMetadataAction: React.FC<IUpdateDaoMetadaActionProps> = (props) => {
    const { index } = props;

    const { mutateAsync: pinJsonAsync } = usePinJson();
    const { mutateAsync: pinFileAsync } = usePinFile();
    const { addPrepareAction } = useCreateProposalFormContext();

    const fieldName = `actions.[${index.toString()}]`;
    useFormField<Record<string, IProposalActionData>, typeof fieldName>(fieldName);

    const prepareAction = useCallback(
        async (action: IProposalCreateAction) => {
            const { name, description, resources, avatar } = (action as unknown as IUpdateDaoMetadataAction)
                .proposedMetadata;
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
            const hexResult = transactionUtils.cidToHex(ipfsResult.IpfsHash);
            const data = encodeFunctionData({ abi: [setMetadataAbi], args: [hexResult] });

            return data;
        },
        [pinFileAsync, pinJsonAsync],
    );

    useEffect(() => {
        addPrepareAction(ProposalActionType.METADATA_UPDATE, prepareAction);
    }, [addPrepareAction, prepareAction]);

    return <CreateDaoForm.Metadata fieldPrefix={`${fieldName}.proposedMetadata`} />;
};
