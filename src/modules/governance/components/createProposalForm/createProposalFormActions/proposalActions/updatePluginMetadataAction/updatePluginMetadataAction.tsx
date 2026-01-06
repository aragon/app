import { AlertInline, Button } from '@aragon/gov-ui-kit';
import { useCallback, useEffect } from 'react';
import { encodeFunctionData } from 'viem';
import { CreateProcessForm } from '@/modules/createDao/components/createProcessForm';
import { ProposalActionType } from '@/modules/governance/api/governanceService/domain';
import { setMetadataAbi } from '@/modules/governance/constants/setMetadataAbi';
import { useMetadataActionPin } from '@/modules/governance/hooks/useMetadataActionPin';
import { usePinJson } from '@/shared/api/ipfsService/mutations';
import { useFormField } from '@/shared/hooks/useFormField';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import type { IProposalActionData } from '../../../createProposalFormDefinitions';
import { useCreateProposalFormContext } from '../../../createProposalFormProvider';
import type {
    IUpdatePluginMetadataAction,
    IUpdatePluginMetadataActionProps,
} from './updatePluginMetadataAction.api';

export const UpdatePluginMetadataAction: React.FC<
    IUpdatePluginMetadataActionProps
> = (props) => {
    const { index, action } = props;

    const meta = action.meta as
        | { isProcess?: boolean; isSubPlugin?: boolean }
        | undefined;
    const isProcess = meta?.isProcess ?? false;
    const isSubPlugin = meta?.isSubPlugin ?? false;

    const { mutateAsync: pinJsonAsync } = usePinJson();
    // Type assertion needed because IUpdatePluginMetadataAction has optional data (before pinning)
    // but prepareAction callback will populate it, satisfying IProposalCreateAction requirements
    const { addPrepareAction } = useCreateProposalFormContext<
        IUpdatePluginMetadataAction & { data: string }
    >();

    const actionFieldName = `actions.[${index.toString()}]`;
    useFormField<Record<string, IProposalActionData>, typeof actionFieldName>(
        actionFieldName,
    );

    const displayProcessKey = isProcess && !isSubPlugin;

    // Auto-pin metadata in background with debouncing
    const { pinError, triggerPin, clearError } = useMetadataActionPin({
        actionIndex: index,
        actionType: ProposalActionType.METADATA_PLUGIN_UPDATE,
        enabled: true,
    });

    const prepareAction = useCallback(
        async (action: IUpdatePluginMetadataAction) => {
            // If background pinning already populated the data field, use it instead of re-pinning
            if (
                action.data &&
                action.data !== '0x' &&
                action.ipfsMetadata?.pinnedData
            ) {
                return action.ipfsMetadata.pinnedData;
            }

            // Otherwise, perform fresh IPFS pinning (fallback for edge cases or if background pinning failed)
            const { proposedMetadata, existingMetadata } = action;
            const { name, description, resources, processKey } =
                proposedMetadata;

            const pluginMetadata = {
                ...existingMetadata,
                name,
                description,
                links: resources,
            };

            if (displayProcessKey) {
                pluginMetadata.processKey = processKey;
            }

            const ipfsResult = await pinJsonAsync({ body: pluginMetadata });
            const hexResult = transactionUtils.stringToMetadataHex(
                ipfsResult.IpfsHash,
            );
            const data = encodeFunctionData({
                abi: [setMetadataAbi],
                args: [hexResult],
            });

            return data;
        },
        [pinJsonAsync, displayProcessKey],
    );

    useEffect(() => {
        addPrepareAction(
            ProposalActionType.METADATA_PLUGIN_UPDATE,
            prepareAction,
        );
    }, [addPrepareAction, prepareAction]);

    return (
        <div className="flex flex-col gap-4">
            {pinError && (
                <AlertInline
                    message={`Failed to prepare action: ${pinError.message}`}
                    variant="critical"
                >
                    <Button onClick={triggerPin} size="sm" variant="tertiary">
                        Retry
                    </Button>
                    <Button onClick={clearError} size="sm" variant="tertiary">
                        Dismiss
                    </Button>
                </AlertInline>
            )}

            <CreateProcessForm.Metadata
                displayProcessKey={displayProcessKey}
                fieldPrefix={`${actionFieldName}.proposedMetadata`}
                pluginType={displayProcessKey ? 'process' : 'plugin'}
            />
        </div>
    );
};
