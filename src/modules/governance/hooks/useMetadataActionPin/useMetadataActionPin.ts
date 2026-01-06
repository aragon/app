import { useDebouncedValue } from '@aragon/gov-ui-kit';
import { useCallback, useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { usePinFile, usePinJson } from '@/shared/api/ipfsService/mutations';
import { ProposalActionType } from '../../api/governanceService';
import type { ICreateProposalFormData } from '../../components/createProposalForm/createProposalFormDefinitions';
import type { IMetadataAction } from '../../utils/metadataActionPinUtils';
import { metadataActionPinUtils } from '../../utils/metadataActionPinUtils';
import type {
    IUseMetadataActionPinParams,
    IUseMetadataActionPinReturn,
} from './useMetadataActionPin.api';

type PinStatus = 'idle' | 'pending' | 'success' | 'error';

export const useMetadataActionPin = (
    params: IUseMetadataActionPinParams,
): IUseMetadataActionPinReturn => {
    const { actionIndex, actionType, enabled = true } = params;

    const { setValue } = useFormContext<ICreateProposalFormData>();
    const fieldName = `actions.${actionIndex}` as const;

    // Watch the action for changes
    // The action from the form matches IMetadataAction with flexible metadata fields
    const action = useWatch({ name: fieldName }) as IMetadataAction | undefined;

    // Debounce the action value by 3 seconds
    const [debouncedAction] = useDebouncedValue(action, { delay: 3000 });

    const [pinStatus, setPinStatus] = useState<PinStatus>('idle');
    const [pinError, setPinError] = useState<Error | null>(null);

    const { mutateAsync: pinJson } = usePinJson();
    const { mutateAsync: pinFile } = usePinFile();

    // Pin execution logic
    const executePinning = useCallback(async () => {
        if (!(enabled && debouncedAction)) {
            return;
        }

        // Check if repinning is needed
        const currentHash =
            metadataActionPinUtils.hashActionData(debouncedAction);
        if (
            !metadataActionPinUtils.needsRepinning(debouncedAction, currentHash)
        ) {
            return;
        }

        setPinStatus('pending');
        setPinError(null);

        // Set isPinning flag in form state for gating
        setValue(`${fieldName}.ipfsMetadata.isPinning`, true, {
            shouldValidate: false,
        });

        try {
            const pinFunction =
                actionType === ProposalActionType.METADATA_UPDATE
                    ? metadataActionPinUtils.pinDaoMetadataAction
                    : metadataActionPinUtils.pinPluginMetadataAction;

            const result = await pinFunction({
                action: debouncedAction,
                pinJson,
                pinFile,
            });

            // Update form with pinned data and metadata
            setValue(`${fieldName}.data`, result.encodedData, {
                shouldValidate: false,
            });
            setValue(
                `${fieldName}.ipfsMetadata`,
                {
                    metadataCid: result.metadataCid,
                    avatarCid: result.avatarCid,
                    pinnedData: result.encodedData,
                    pinnedAt: Date.now(),
                    sourceHash: result.sourceHash,
                    isPinning: false,
                },
                { shouldValidate: false },
            );

            setPinStatus('success');
        } catch (error) {
            setPinError(error as Error);
            setPinStatus('error');

            // Clear isPinning flag on error
            setValue(`${fieldName}.ipfsMetadata.isPinning`, false, {
                shouldValidate: false,
            });
        }
    }, [
        debouncedAction,
        enabled,
        actionType,
        pinJson,
        pinFile,
        setValue,
        fieldName,
    ]);

    // Auto-trigger on debounced value change
    useEffect(() => {
        void executePinning();
    }, [executePinning]);

    // Clear error handler
    const clearError = useCallback(() => {
        setPinError(null);
        if (pinStatus === 'error') {
            setPinStatus('idle');
        }
    }, [pinStatus]);

    return {
        isPinning: pinStatus === 'pending',
        pinError,
        pinStatus,
        triggerPin: executePinning,
        clearError,
    };
};
