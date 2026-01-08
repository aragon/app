import { useCallback, useState } from 'react';
import { usePinFile, usePinJson } from '@/shared/api/ipfsService/mutations';
import { ProposalActionType } from '../../api/governanceService';
import { metadataActionPinUtils } from '../../utils/metadataActionPinUtils';
import type {
    IMetadataActionWithIndex,
    IPinResult,
    IUseMetadataActionPinReturn,
} from './useMetadataActionPin.api';

export const useMetadataActionPin = (): IUseMetadataActionPinReturn => {
    const [isPinning, setIsPinning] = useState(false);
    const [pinErrors, setPinErrors] = useState<Map<number, Error>>(new Map());

    const { mutateAsync: pinJson } = usePinJson();
    const { mutateAsync: pinFile } = usePinFile();

    const clearError = useCallback((actionIndex: number) => {
        setPinErrors((prev) => {
            const next = new Map(prev);
            next.delete(actionIndex);
            return next;
        });
    }, []);

    const clearAllErrors = useCallback(() => {
        setPinErrors(new Map());
    }, []);

    const pinMetadataActions = useCallback(
        async (actions: IMetadataActionWithIndex[]): Promise<IPinResult[]> => {
            setIsPinning(true);
            clearAllErrors();

            const pinPromises = actions.map(
                async ({ action, actionIndex, actionType }) => {
                    try {
                        const currentHash =
                            metadataActionPinUtils.hashActionData(action);

                        if (
                            !metadataActionPinUtils.needsRepinning(
                                action,
                                currentHash,
                            )
                        ) {
                            return {
                                actionIndex,
                                success: true,
                                metadataCid: action.ipfsMetadata!.metadataCid,
                                avatarCid: action.ipfsMetadata?.avatarCid,
                                encodedData: action.ipfsMetadata!.pinnedData,
                                sourceHash: action.ipfsMetadata!.sourceHash,
                            };
                        }

                        const pinFunction =
                            actionType === ProposalActionType.METADATA_UPDATE
                                ? metadataActionPinUtils.pinDaoMetadataAction
                                : metadataActionPinUtils.pinPluginMetadataAction;

                        const result = await pinFunction({
                            action,
                            pinJson,
                            pinFile,
                        });

                        return {
                            actionIndex,
                            success: true,
                            ...result,
                        };
                    } catch (error) {
                        return {
                            actionIndex,
                            success: false,
                            error: error as Error,
                        };
                    }
                },
            );

            const results = await Promise.allSettled(pinPromises);

            const pinResults: IPinResult[] = [];
            const newErrors = new Map<number, Error>();

            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    const pinResult = result.value;
                    pinResults.push(pinResult);

                    if (!pinResult.success && pinResult.error) {
                        newErrors.set(pinResult.actionIndex, pinResult.error);
                    }
                } else {
                    const actionIndex = actions[index].actionIndex;
                    newErrors.set(actionIndex, result.reason as Error);
                    pinResults.push({
                        actionIndex,
                        success: false,
                        error: result.reason as Error,
                    });
                }
            });

            setPinErrors(newErrors);
            setIsPinning(false);

            return pinResults;
        },
        [pinJson, pinFile, clearAllErrors],
    );

    return {
        pinMetadataActions,
        isPinning,
        pinErrors,
        clearError,
        clearAllErrors,
    };
};
