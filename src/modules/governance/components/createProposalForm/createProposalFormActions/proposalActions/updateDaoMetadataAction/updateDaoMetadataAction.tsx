import { CreateDaoForm, type ICreateDaoFormMetadataData } from '@/modules/createDao/components/createDaoForm';
import {
    ProposalActionType,
    type IProposalAction,
    type IProposalActionUpdateMetadata,
} from '@/modules/governance/api/governanceService';
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
    async (action: IProposalAction) => {
        const { name, description, resources, avatar } = (action as IUpdateDaoMetadataAction).proposedMetadata;
        const proposedMetadata = { name, description, links: resources };

        let daoAvatar: string | undefined;

        if (typeof avatar === 'string') {
            daoAvatar = avatar;
        } else if (avatar?.file != null) {
            const avatarResult = await pinFileAsync({ body: avatar.file });
            daoAvatar = ipfsUtils.cidToUri(avatarResult.IpfsHash);
        }

        const metadata = daoAvatar ? { ...proposedMetadata, avatar: daoAvatar } : proposedMetadata;

        const ipfsResult = await pinJsonAsync({ body: metadata });
        const hexResult = transactionUtils.cidToHex(ipfsResult.IpfsHash);
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

    return <CreateDaoForm.Metadata fieldPrefix={`${fieldName}.proposedMetadata`} />;
};
