'use client';

import {
    AlertInline,
    addressUtils,
    Button,
    Dropdown,
    IconType,
    Switch,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useCallback, useRef, useState } from 'react';
import type { IDaoPermission } from '@/shared/api/daoService';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IAllowedAction } from '../../../api/executeSelectorsService';
import type { IProposalAction } from '../../../api/governanceService';
import type { ISmartContractAbi } from '../../../api/smartContractService';
import { GovernanceDialogId } from '../../../constants/governanceDialogId';
import type { IVerifySmartContractDialogParams } from '../../../dialogs/verifySmartContractDialog';
import type { IWalletConnectActionDialogParams } from '../../../dialogs/walletConnectActionDialog';
import {
    type IExportedAction,
    proposalActionsImportExportUtils,
} from '../../../utils/proposalActionsImportExportUtils';
import type { IProposalActionData } from '../../createProposalForm';
import {
    ActionComposerInput,
    type IActionComposerInputItem,
    type IActionComposerInputProps,
} from '../actionComposerInput';
import { actionComposerUtils } from '../actionComposerUtils';
import { ActionItemId } from '../actionComposerUtils.api';

export interface IActionComposerProps
    extends Pick<IActionComposerInputProps, 'excludeActionTypes'> {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Callback called when an action is added.
     * @param value - single action or array of actions to be added.
     */
    onAddAction: (value: IProposalActionData[]) => void;
    /**
     * If true, hides the WalletConnect button.
     */
    hideWalletConnect?: boolean;
    /**
     * Allowed actions to show instead of default actions.
     */
    allowedActions?: IAllowedAction[];
    /**
     * Whether there are actions to manage (for download/remove dropdown visibility).
     */
    hasActions?: boolean;
    /**
     * Callback triggered when the user downloads all actions.
     */
    onDownloadActions?: () => void;
    /**
     * Granted permissions for DAO.
     */
    daoPermissions?: IDaoPermission[];
    /**
     * Callback called when all actions should be removed.
     */
    onRemoveAllActions?: () => void;
    /**
     * Whether any metadata actions are currently being prepared or are unprepared.
     * When true, the download button will be disabled.
     */
    hasUnpreparedMetadata?: boolean;
}

export const ActionComposer: React.FC<IActionComposerProps> = (props) => {
    const {
        daoId,
        onAddAction,
        excludeActionTypes,
        hideWalletConnect = false,
        allowedActions,
        hasActions = false,
        onDownloadActions,
        daoPermissions,
        onRemoveAllActions,
        hasUnpreparedMetadata = false,
    } = props;

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const { items, groups } = actionComposerUtils.getDaoActions({
        dao,
        permissions: daoPermissions,
        t,
    });

    const autocompleteInputRef = useRef<HTMLInputElement | null>(null);
    const fileUploadInputRef = useRef<HTMLInputElement | null>(null);

    const [displayActionComposer, setDisplayActionComposer] = useState(false);
    const [onlyShowAuthorizedActions, setOnlyShowAuthorizedActions] = useState(
        allowedActions != null,
    );
    const [uploadError, setUploadError] = useState<string | null>(null);

    const [importedContractAbis, setImportedContractAbis] = useState<
        ISmartContractAbi[]
    >([]);

    const addImportedContractAbi = useCallback(
        (abi: ISmartContractAbi) =>
            setImportedContractAbis((current) => {
                const alreadyExists = current.some((currentAbi) =>
                    addressUtils.isAddressEqual(
                        currentAbi.address,
                        abi.address,
                    ),
                );

                return alreadyExists ? current : [abi, ...current];
            }),
        [],
    );

    const handleAddAction = () => {
        setUploadError(null);
        autocompleteInputRef.current?.focus();
    };

    const handleAbiSubmit = (abi: ISmartContractAbi) => {
        addImportedContractAbi(abi);
        handleAddAction();
    };

    const handleVerifySmartContract = (initialValue?: string) => {
        const params: IVerifySmartContractDialogParams = {
            network: dao!.network,
            onSubmit: handleAbiSubmit,
            initialValue,
        };
        open(GovernanceDialogId.VERIFY_SMART_CONTRACT, { params });
    };

    const handleAddWalletConnectActions = (actions: IProposalAction[]) => {
        const parsedActions = actions.map((action) => ({
            ...action,
            daoId,
            meta: undefined,
        }));
        onAddAction(parsedActions);
    };

    const displayWalletConnectDialog = () => {
        setUploadError(null);
        const params: IWalletConnectActionDialogParams = {
            onAddActionsClick: handleAddWalletConnectActions,
            daoAddress: dao!.address,
            daoNetwork: dao!.network,
        };
        open(GovernanceDialogId.WALLET_CONNECT_ACTION, { params });
    };

    const handleImportActions = (actions: IExportedAction[]) => {
        const parsedActions = actions.map((action) => {
            const actionId = crypto.randomUUID();
            return {
                to: action.to,
                value: BigInt(action.value),
                data: action.data,
                id: actionId,
                daoId,
                meta: undefined,
            } as unknown as IProposalActionData;
        });
        onAddAction(parsedActions);
    };

    const handleDirectFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        setUploadError(null);

        try {
            const fileContent =
                await proposalActionsImportExportUtils.readFileAsText(file);
            const result =
                proposalActionsImportExportUtils.validateAndParseActions(
                    fileContent,
                );

            if (result.success && result.actions) {
                handleImportActions(result.actions);
                setUploadError(null);
            } else if (result.errorKey) {
                setUploadError(t(result.errorKey));
            }
        } catch {
            setUploadError(
                t(
                    'app.governance.createProposalForm.actionsImportExport.errors.invalidJSON',
                ),
            );
        }

        event.target.value = '';
    };

    const triggerFileUpload = () => {
        fileUploadInputRef.current?.click();
    };

    const handleItemSelected = (
        action: IActionComposerInputItem,
        inputValue: string,
    ) => {
        const { id, defaultValue, meta } = action;

        if (defaultValue != null) {
            const actionId = crypto.randomUUID();
            onAddAction([{ ...defaultValue, id: actionId, daoId, meta }]);
        } else if (id === ActionItemId.ADD_CONTRACT) {
            handleVerifySmartContract(inputValue);
        }
    };

    const handleDownloadActions = () => {
        if (!onDownloadActions) {
            return;
        }

        onDownloadActions();
    };

    const handleRemoveAllActions = () => {
        if (!onRemoveAllActions) {
            return;
        }

        onRemoveAllActions();
    };

    const shouldRenderDropdown =
        onDownloadActions != null && onRemoveAllActions != null;

    const shouldRenderWalletConnect = !(
        hideWalletConnect || onlyShowAuthorizedActions
    );

    return (
        <>
            <div
                className={classNames('flex flex-col gap-3', {
                    hidden: displayActionComposer,
                })}
            >
                <div className="flex items-center justify-between">
                    <div className="flex flex-row gap-3">
                        <Button
                            iconLeft={IconType.PLUS}
                            onClick={handleAddAction}
                            size="md"
                            variant="primary"
                        >
                            {t(
                                'app.governance.actionComposer.addAction.default',
                            )}
                        </Button>
                        {shouldRenderWalletConnect && (
                            <Button
                                iconRight={IconType.BLOCKCHAIN_WALLETCONNECT}
                                onClick={displayWalletConnectDialog}
                                size="md"
                                variant="secondary"
                            >
                                {t(
                                    'app.governance.actionComposer.addAction.walletConnect',
                                )}
                            </Button>
                        )}
                        <Button
                            iconLeft={IconType.WITHDRAW}
                            onClick={triggerFileUpload}
                            size="md"
                            variant={uploadError ? 'critical' : 'tertiary'}
                        >
                            {t(
                                'app.governance.createProposalForm.actionsImportExport.importButton',
                            )}
                        </Button>
                        <input
                            accept=".json"
                            className="hidden"
                            onChange={handleDirectFileUpload}
                            ref={fileUploadInputRef}
                            type="file"
                        />
                    </div>
                    <div className="flex flex-row items-center gap-3">
                        {shouldRenderDropdown && hasActions && (
                            <Dropdown.Container
                                constrainContentWidth={false}
                                customTrigger={
                                    <Button
                                        className="w-fit"
                                        iconRight={IconType.DOTS_VERTICAL}
                                        size="md"
                                        variant="tertiary"
                                    >
                                        {t(
                                            'app.governance.actionComposer.moreActions',
                                        )}
                                    </Button>
                                }
                                size="md"
                            >
                                <Dropdown.Item
                                    disabled={hasUnpreparedMetadata}
                                    onClick={handleDownloadActions}
                                >
                                    {hasUnpreparedMetadata
                                        ? t(
                                              'app.governance.actionComposer.downloadWait',
                                          )
                                        : t(
                                              'app.governance.actionComposer.downloadAllActions',
                                          )}
                                </Dropdown.Item>
                                <Dropdown.Item onClick={handleRemoveAllActions}>
                                    {t(
                                        'app.governance.actionComposer.removeAllActions',
                                    )}
                                </Dropdown.Item>
                            </Dropdown.Container>
                        )}
                        {allowedActions && (
                            <div>
                                <Switch
                                    checked={onlyShowAuthorizedActions}
                                    inlineLabel={t(
                                        'app.governance.actionComposer.authorizedSwitchLabel',
                                    )}
                                    onCheckedChanged={
                                        setOnlyShowAuthorizedActions
                                    }
                                />
                            </div>
                        )}
                    </div>
                </div>
                {uploadError && (
                    <AlertInline message={uploadError} variant="critical" />
                )}
            </div>
            <ActionComposerInput
                allowedActions={
                    onlyShowAuthorizedActions ? allowedActions : undefined
                }
                daoId={daoId}
                excludeActionTypes={excludeActionTypes}
                importedContractAbis={importedContractAbis}
                nativeGroups={groups}
                nativeItems={items}
                onActionSelected={handleItemSelected}
                onOpenChange={setDisplayActionComposer}
                ref={autocompleteInputRef}
                wrapperClassName={classNames('transition-none', {
                    '!sr-only': !displayActionComposer,
                })}
            />
        </>
    );
};
