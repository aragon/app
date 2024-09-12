import { CreateDaoForm } from '@/modules/createDao/components/createDaoForm';
import { ProposalActionType, type IProposalActionUpdateMetadata } from '@/modules/governance/api/governanceService';
import { usePinJson } from '@/shared/api/ipfsService/mutations';
import { useFormField } from '@/shared/hooks/useFormField';
import type { IProposalActionComponentProps } from '@aragon/ods';
import { useCallback, useEffect } from 'react';
import { encodeFunctionData, toHex } from 'viem';
import type { IProposalActionIndexed } from '../../../createProposalFormDefinitions';
import { useCreateProposalFormContext } from '../../../createProposalFormProvider';

export interface IUpdateDaoMetadaActionProps
    extends IProposalActionComponentProps<IProposalActionUpdateMetadata & { index: number }> {}

const setMetadataAbi = [
    {
        type: 'function',
        inputs: [{ name: '_metadata', internalType: 'bytes', type: 'bytes' }],
        name: 'setMetadata',
        outputs: [],
        stateMutability: 'nonpayable',
    },
];

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
            // TODO: share toHex function on publishProposalUtils
            const hexResult = toHex(`ipfs://${ipfsResult.IpfsHash}`);

            const data = encodeFunctionData({
                abi: setMetadataAbi,
                functionName: 'setMetadata',
                args: [hexResult],
            });

            return { data };
        },
        [pinJsonAsync],
    );

    useEffect(() => {
        // @ts-expect-error TODO
        addPrepareAction(ProposalActionType.METADATA_UPDATE, prepareAction);
    }, [addPrepareAction, prepareAction]);

    return <CreateDaoForm.Metadata fieldPrefix={`${fieldName}.proposedMetadata`} />;
};
