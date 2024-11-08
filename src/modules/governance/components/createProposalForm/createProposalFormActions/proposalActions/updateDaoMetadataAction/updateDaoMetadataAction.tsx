import { CreateDaoForm } from '@/modules/createDao/components/createDaoForm';
import {
    ProposalActionType,
    type IProposalAction,
    type IProposalActionUpdateMetadata,
} from '@/modules/governance/api/governanceService';
import { type IResource } from '@/shared/api/daoService';
import { usePinJson } from '@/shared/api/ipfsService/mutations';
import { useFormField } from '@/shared/hooks/useFormField';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import type { IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import { useCallback, useEffect } from 'react';
import { encodeFunctionData } from 'viem';
import type { IProposalActionData } from '../../../createProposalFormDefinitions';
import { useCreateProposalFormContext } from '../../../createProposalFormProvider';

export interface IUpdateDaoMetadataAction
    extends Omit<IProposalAction, 'type'>,
        Omit<IProposalActionUpdateMetadata, 'proposedMetadata'> {
    proposedMetadata: {
        name: string;
        description: string;
        resources: IResource[];
    };
}

export interface IUpdateDaoMetadaActionProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction>> {}

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
    const { addPrepareAction } = useCreateProposalFormContext();

    const fieldName = `actions.[${index}]`;
    useFormField<Record<string, IProposalActionData>, typeof fieldName>(fieldName);

    const prepareAction = useCallback(
        async (action: IProposalAction) => {
            const { proposedMetadata } = action as IUpdateDaoMetadataAction;

            const body = {
                name: proposedMetadata.name,
                description: proposedMetadata.description,
                links: proposedMetadata.resources,
            };

            const ipfsResult = await pinJsonAsync({ body });
            const hexResult = transactionUtils.cidToHex(ipfsResult.IpfsHash);

            const data = encodeFunctionData({ abi: [setMetadataAbi], args: [hexResult] });

            return data;
        },
        [pinJsonAsync],
    );

    useEffect(() => {
        addPrepareAction(ProposalActionType.METADATA_UPDATE, prepareAction);
    }, [addPrepareAction, prepareAction]);

    return <CreateDaoForm.Metadata fieldPrefix={`${fieldName}.proposedMetadata`} />;
};
