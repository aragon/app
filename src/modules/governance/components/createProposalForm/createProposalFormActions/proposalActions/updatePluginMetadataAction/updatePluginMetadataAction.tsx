import { CreateProcessForm } from '@/modules/createDao/components/createProcessForm';
import { ProposalActionType } from '@/modules/governance/api/governanceService/domain';
import { usePinJson } from '@/shared/api/ipfsService/mutations';
import { useFormField } from '@/shared/hooks/useFormField';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { useCallback, useEffect } from 'react';
import { encodeFunctionData } from 'viem';
import type { IProposalActionData } from '../../../createProposalFormDefinitions';
import { useCreateProposalFormContext } from '../../../createProposalFormProvider';
import type { IUpdatePluginMetadataAction, IUpdatePluginMetadataActionProps } from './updatePluginMetadataAction.api';
import type { IProposalCreateAction } from '@/modules/governance/dialogs/publishProposalDialog';

const setMetadataAbi = {
    type: 'function',
    inputs: [{ name: '_metadata', internalType: 'bytes', type: 'bytes' }],
    name: 'setMetadata',
    outputs: [],
    stateMutability: 'nonpayable',
};

export const UpdatePluginMetadataAction: React.FC<IUpdatePluginMetadataActionProps> = (props) => {
    const { index, action } = props;

    const { meta } = action;
    const { isProcess, isSubPlugin } = meta;

    const { mutateAsync: pinJsonAsync } = usePinJson();
    const { addPrepareAction } = useCreateProposalFormContext();

    const actionFieldName = `actions.[${index.toString()}]`;
    useFormField<Record<string, IProposalActionData>, typeof actionFieldName>(actionFieldName);

    const displayProcessKey = isProcess && !isSubPlugin;

    const prepareAction = useCallback(
        async (action: IProposalCreateAction) => {
            const { proposedMetadata, existingMetadata } = action as unknown as IUpdatePluginMetadataAction;
            const { name, description, resources, processKey } = proposedMetadata;

            const pluginMetadata = { ...existingMetadata, name, description, links: resources };

            if (displayProcessKey) {
                pluginMetadata.processKey = processKey;
            }

            const ipfsResult = await pinJsonAsync({ body: pluginMetadata });
            const hexResult = transactionUtils.cidToHex(ipfsResult.IpfsHash);
            const data = encodeFunctionData({ abi: [setMetadataAbi], args: [hexResult] });

            return data;
        },
        [pinJsonAsync, displayProcessKey],
    );

    useEffect(() => {
        addPrepareAction(ProposalActionType.METADATA_PLUGIN_UPDATE, prepareAction);
    }, [addPrepareAction, prepareAction]);

    return (
        <CreateProcessForm.Metadata
            displayProcessKey={displayProcessKey}
            fieldPrefix={`${actionFieldName}.proposedMetadata`}
            pluginType={displayProcessKey ? 'process' : 'plugin'}
        />
    );
};
