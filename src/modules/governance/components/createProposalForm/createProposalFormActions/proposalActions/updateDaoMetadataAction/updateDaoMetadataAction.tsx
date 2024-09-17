import { CreateDaoForm } from '@/modules/createDao/components/createDaoForm';
import { ProposalActionType, type IProposalActionUpdateMetadata } from '@/modules/governance/api/governanceService';
import { usePinJson } from '@/shared/api/ipfsService/mutations';
import { useFormField } from '@/shared/hooks/useFormField';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import type { IProposalActionComponentProps } from '@aragon/ods';
import { useCallback, useEffect } from 'react';
import { encodeFunctionData } from 'viem';
import type { IProposalActionIndexed } from '../../../createProposalFormDefinitions';
import { useCreateProposalFormContext, type PrepareProposalActionFunction } from '../../../createProposalFormProvider';

export interface IUpdateDaoMetadaActionProps
    extends IProposalActionComponentProps<IProposalActionIndexed<IProposalActionUpdateMetadata>> {}

const setMetadataAbi = {
    type: 'function',
    inputs: [{ name: '_metadata', internalType: 'bytes', type: 'bytes' }],
    name: 'setMetadata',
    outputs: [],
    stateMutability: 'nonpayable',
};

export const UpdateDaoMetadataAction: React.FC<IUpdateDaoMetadaActionProps> = (props) => {
    const { action } = props;

    const { mutateAsync: pinJsonAsync } = usePinJson();
    const { addPrepareAction } = useCreateProposalFormContext();

    const fieldName = `actions.[${action.index}]`;
    useFormField<Record<string, IProposalActionIndexed>, typeof fieldName>(fieldName);

    const prepareAction = useCallback(
        async (action: IProposalActionUpdateMetadata) => {
            const { proposedMetadata } = action;

            const ipfsResult = await pinJsonAsync({ body: proposedMetadata });
            const hexResult = transactionUtils.cidToHex(ipfsResult.IpfsHash);

            const data = encodeFunctionData({ abi: [setMetadataAbi], args: [hexResult] });

            return data;
        },
        [pinJsonAsync],
    );

    useEffect(() => {
        addPrepareAction(ProposalActionType.METADATA_UPDATE, prepareAction as PrepareProposalActionFunction);
    }, [addPrepareAction, prepareAction]);

    return <CreateDaoForm.Metadata fieldPrefix={`${fieldName}.proposedMetadata`} />;
};
