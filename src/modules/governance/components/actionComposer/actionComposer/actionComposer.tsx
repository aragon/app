'use client';

import type { IDaoPermission } from '@/shared/api/daoService';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { addressUtils, Button, IconType, Switch } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useCallback, useRef, useState } from 'react';
import type { IAllowedAction } from '../../../api/executeSelectorsService';
import { type IProposalAction } from '../../../api/governanceService';
import type { ISmartContractAbi } from '../../../api/smartContractService';
import { GovernanceDialogId } from '../../../constants/governanceDialogId';
import type { IVerifySmartContractDialogParams } from '../../../dialogs/verifySmartContractDialog';
import type { IWalletConnectActionDialogParams } from '../../../dialogs/walletConnectActionDialog';
import type { IProposalActionData } from '../../createProposalForm';
import {
    ActionComposerInput,
    type IActionComposerInputItem,
    type IActionComposerInputProps,
} from '../actionComposerInput';
import { actionComposerUtils } from '../actionComposerUtils';
import { ActionItemId } from '../actionComposerUtils.api';

export interface IActionComposerProps extends Pick<IActionComposerInputProps, 'excludeActionTypes'> {
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
     * Granted permissions for DAO.
     */
    daoPermissions?: IDaoPermission[];
}

export const ActionComposer: React.FC<IActionComposerProps> = (props) => {
    const { daoId, onAddAction, excludeActionTypes, hideWalletConnect = false, allowedActions, daoPermissions } = props;

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const { items, groups } = actionComposerUtils.getDaoActions({ dao, permissions: daoPermissions, t });

    const autocompleteInputRef = useRef<HTMLInputElement | null>(null);

    const [displayActionComposer, setDisplayActionComposer] = useState(false);
    const [onlyShowAuthorizedActions, setOnlyShowAuthorizedActions] = useState(allowedActions != null);

    const [importedContractAbis, setImportedContractAbis] = useState<ISmartContractAbi[]>([]);

    const addImportedContractAbi = useCallback(
        (abi: ISmartContractAbi) =>
            setImportedContractAbis((current) => {
                const alreadyExists = current.some((currentAbi) =>
                    addressUtils.isAddressEqual(currentAbi.address, abi.address),
                );

                return alreadyExists ? current : [abi, ...current];
            }),
        [],
    );

    const handleAddAction = () => {
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
        const parsedActions = actions.map((action) => ({ ...action, daoId, meta: undefined }));
        onAddAction(parsedActions);
    };

    const displayWalletConnectDialog = () => {
        const params: IWalletConnectActionDialogParams = {
            onAddActionsClick: handleAddWalletConnectActions,
            daoAddress: dao!.address,
            daoNetwork: dao!.network,
        };
        open(GovernanceDialogId.WALLET_CONNECT_ACTION, { params });
    };

    const handleItemSelected = (action: IActionComposerInputItem, inputValue: string) => {
        const { id, defaultValue, meta } = action;

        if (defaultValue != null) {
            const actionId = crypto.randomUUID();
            onAddAction([{ ...defaultValue, id: actionId, daoId, meta }]);
        } else if (id === ActionItemId.ADD_CONTRACT) {
            handleVerifySmartContract(inputValue);
        }
    };

    const shouldRenderWalletConnect = !(hideWalletConnect || onlyShowAuthorizedActions);

    return (
        <>
            <div className={classNames('flex items-center justify-between', { hidden: displayActionComposer })}>
                <div className="flex flex-row gap-3">
                    <Button variant="primary" size="md" iconLeft={IconType.PLUS} onClick={handleAddAction}>
                        {t('app.governance.actionComposer.addAction.default')}
                    </Button>
                    {shouldRenderWalletConnect && (
                        <Button
                            variant="secondary"
                            size="md"
                            iconRight={IconType.BLOCKCHAIN_WALLETCONNECT}
                            onClick={displayWalletConnectDialog}
                        >
                            {t('app.governance.actionComposer.addAction.walletConnect')}
                        </Button>
                    )}
                </div>
                {allowedActions && (
                    // wrapper div needed here to tackle grow css prop in InputContainer inside Switch, which we cannot override
                    <div>
                        <Switch
                            checked={onlyShowAuthorizedActions}
                            onCheckedChanged={setOnlyShowAuthorizedActions}
                            inlineLabel={t('app.governance.actionComposer.authorizedSwitchLabel')}
                        />
                    </div>
                )}
            </div>
            <ActionComposerInput
                wrapperClassName={classNames('transition-none', { '!sr-only': !displayActionComposer })}
                onActionSelected={handleItemSelected}
                onOpenChange={setDisplayActionComposer}
                ref={autocompleteInputRef}
                nativeItems={items}
                nativeGroups={groups}
                allowedActions={onlyShowAuthorizedActions ? allowedActions : undefined}
                daoId={daoId}
                importedContractAbis={importedContractAbis}
                excludeActionTypes={excludeActionTypes}
            />
        </>
    );
};
