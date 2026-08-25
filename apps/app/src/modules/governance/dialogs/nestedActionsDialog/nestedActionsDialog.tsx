'use client';

import { AlertInline, Dialog, invariant } from '@aragon/gov-ui-kit';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { type Network, useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { useAllAllowedActions } from '../../api/executeSelectorsService';
import type { IProposalActionData } from '../../components/createProposalForm';
import { CreateProposalFormProvider } from '../../components/createProposalForm';
import { ProposalActionsEditor } from '../../components/proposalActionsEditor';
import { proposalActionPreparationUtils } from '../../utils/proposalActionPreparationUtils';
import { proposalActionsImportExportUtils } from '../../utils/proposalActionsImportExportUtils';
import type {
    PrepareProposalActionFunction,
    PrepareProposalActionMap,
} from '../publishProposalDialog';
import type {
    INestedActionsDialogProps,
    INestedActionsFormData,
} from './nestedActionsDialog.api';

/**
 * Composes a nested list of actions in an isolated form, used as the payload of actions taking an
 * `Action[]` parameter (e.g. `DAO.execute`). The form is isolated on purpose: the action editor and
 * every custom action component address their fields as `actions.[index]`, so a nested form context
 * lets them be reused as-is while keeping the inner fields out of the outer wizard validation.
 */
export const NestedActionsDialog: React.FC<INestedActionsDialogProps> = (
    props,
) => {
    const { location } = props;

    invariant(
        location.params != null,
        'NestedActionsDialog: required parameters must be set.',
    );

    const {
        hostDaoId,
        processPluginAddress,
        crossChainNetwork,
        initialActions,
        excludeActionTypes,
        onSubmit,
    } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();
    const { data: hostDao } = useDao({ urlParams: { id: hostDaoId } });

    const resolvedNetwork = crossChainNetwork ?? hostDao?.network;

    const isActionsRestricted = processPluginAddress != null;
    const composerChainId =
        resolvedNetwork != null
            ? networkDefinitions[resolvedNetwork].id
            : undefined;

    const { data: allowedActions } = useAllAllowedActions(
        {
            urlParams: {
                network: hostDao?.network as Network,
                pluginAddress: processPluginAddress ?? '',
            },
            chainId: composerChainId,
        },
        { enabled: hostDao != null && isActionsRestricted },
    );

    // The composer reads the allowlist on mount only and treats an undefined list as "every action is
    // allowed", therefore it must not be rendered before the allowed actions of the process resolve.
    const isLoadingAllowedActions =
        isActionsRestricted && allowedActions == null;

    const [prepareActions, setPrepareActions] =
        useState<PrepareProposalActionMap>({});
    const [isPreparing, setIsPreparing] = useState(false);
    const [hasPrepareError, setHasPrepareError] = useState(false);

    const addPrepareAction = useCallback(
        (type: string, prepareAction: PrepareProposalActionFunction) =>
            setPrepareActions((current) => ({
                ...current,
                [type]: prepareAction,
            })),
        [],
    );

    const contextValues = useMemo(
        () => ({ prepareActions, addPrepareAction }),
        [prepareActions, addPrepareAction],
    );

    const methods = useForm<INestedActionsFormData>({
        mode: 'onChange',
        defaultValues: { actions: initialActions },
    });
    const {
        reset,
        trigger,
        getValues,
        formState: { isDirty, isValid },
    } = methods;

    const requiresDecoding =
        initialActions.length > 0 &&
        initialActions.every((action) => action.inputData == null);

    const [isDecoding, setIsDecoding] = useState(requiresDecoding);
    const [hasDecodeError, setHasDecodeError] = useState(false);

    // To make sure decoding is run only once
    const hasDecodingStartedRef = useRef(false);

    useEffect(() => {
        if (!requiresDecoding || hasDecodingStartedRef.current) {
            return;
        }

        if (hostDao == null) {
            return;
        }

        hasDecodingStartedRef.current = true;

        const decodeInitialActions = async () => {
            try {
                invariant(
                    resolvedNetwork != null,
                    'decodeInitialActions: resolvedNetwork not found',
                );

                const decodedActions =
                    await proposalActionsImportExportUtils.decodeActions(
                        initialActions.map(({ to, value, data }) => ({
                            to,
                            value,
                            data,
                        })),
                        resolvedNetwork,
                        crossChainNetwork ? undefined : hostDao,
                    );

                reset({
                    actions: crossChainNetwork
                        ? decodedActions
                        : decodedActions.map(
                              (action) =>
                                  ({
                                      ...action,
                                      daoId: hostDaoId,
                                  }) as IProposalActionData,
                          ),
                });
            } catch (error) {
                monitoringUtils.logError(error, {
                    context: {
                        hostDaoId,
                        crossChainNetwork,
                        message: 'Failed to decode the nested proposal actions',
                    },
                });
                setHasDecodeError(true);
            } finally {
                setIsDecoding(false);
            }
        };

        void decodeInitialActions();
    }, [
        hostDao,
        hostDaoId,
        crossChainNetwork,
        resolvedNetwork,
        initialActions,
        requiresDecoding,
        reset,
    ]);

    const isLoadingActions = isDecoding || isLoadingAllowedActions;
    const isSaveDisabled =
        isLoadingActions || isPreparing || !isDirty || !isValid;

    const handleClose = () => close(location.id);

    const handleSave = async () => {
        const isFormValid = await trigger();

        if (!isFormValid) {
            return;
        }

        setHasPrepareError(false);
        setIsPreparing(true);

        try {
            const preparedActions =
                await proposalActionPreparationUtils.prepareActions({
                    actions: getValues('actions'),
                    prepareActions,
                });

            onSubmit(preparedActions);
            handleClose();
        } catch (error) {
            monitoringUtils.logError(error, {
                context: {
                    hostDaoId,
                    crossChainNetwork,
                    message: 'Failed to prepare the nested proposal actions',
                },
            });
            setHasPrepareError(true);
        } finally {
            setIsPreparing(false);
        }
    };

    return (
        <FormProvider {...methods}>
            <CreateProposalFormProvider value={contextValues}>
                <Dialog.Header
                    description={t(
                        'app.governance.nestedActionsDialog.description',
                    )}
                    onClose={handleClose}
                    title={t('app.governance.nestedActionsDialog.title')}
                />
                <Dialog.Content className="flex flex-col gap-4 pt-2 pb-6">
                    {isLoadingActions ? (
                        <AlertInline
                            message={t(
                                isDecoding
                                    ? 'app.governance.nestedActionsDialog.decoding'
                                    : 'app.governance.nestedActionsDialog.loadingAllowedActions',
                            )}
                            variant="info"
                        />
                    ) : (
                        <ProposalActionsEditor
                            allowedActions={
                                // rough heuristic to improve UX with 'Only show allowed actions' switch resetting on every
                                // dialog open
                                initialActions.length &&
                                allowedActions?.length === 0
                                    ? undefined
                                    : allowedActions
                            }
                            daoId={crossChainNetwork ? undefined : hostDaoId}
                            excludeActionTypes={excludeActionTypes}
                            network={crossChainNetwork}
                        />
                    )}
                    {hasDecodeError && (
                        <AlertInline
                            message={t(
                                'app.governance.nestedActionsDialog.decodeError',
                            )}
                            variant="critical"
                        />
                    )}
                    {hasPrepareError && (
                        <AlertInline
                            message={t(
                                'app.governance.nestedActionsDialog.prepareError',
                            )}
                            variant="critical"
                        />
                    )}
                </Dialog.Content>
                <Dialog.Footer
                    primaryAction={{
                        label: t('app.governance.nestedActionsDialog.save'),
                        disabled: isSaveDisabled,
                        isLoading: isPreparing,
                        onClick: handleSave,
                    }}
                    variant="wizard"
                />
            </CreateProposalFormProvider>
        </FormProvider>
    );
};
