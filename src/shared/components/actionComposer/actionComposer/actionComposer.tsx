'use client';

import { type IProposalAction } from '@/modules/governance/api/governanceService';
import type { ISmartContractAbi } from '@/modules/governance/api/smartContractService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import type { IVerifySmartContractDialogParams } from '@/modules/governance/dialogs/verifySmartContractDialog';
import type { IWalletConnectActionDialogParams } from '@/modules/governance/dialogs/walletConnectActionDialog';
import { addressUtils, Button, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useCallback, useRef, useState } from 'react';
import { useDao } from '../../../api/daoService';
import { useDialogContext } from '../../dialogProvider';
import { useTranslations } from '../../translationsProvider';
import {
    ActionComposerInput,
    ActionItemId,
    type IActionComposerInputItem,
    type IActionComposerInputProps,
} from '../actionComposerInput';

export interface IActionComposerProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Callback called when an action is added.
     * @param value - single action or array of actions to be added.
     */
    onAddAction: (value: IProposalActionData | IProposalActionData[]) => void;
    /**
     * Native groups to be displayed in the action composer input.
     */
    nativeGroups: IActionComposerInputProps['nativeGroups'];
    /**
     * Native items to be displayed in the action composer input.
     */
    nativeItems: IActionComposerInputProps['nativeItems'];
    /**
     * If true, hides the WalletConnect button.
     */
    hideWalletConnect?: boolean;
}

export const ActionComposer: React.FC<IActionComposerProps> = (props) => {
    const { daoId, onAddAction, nativeGroups, nativeItems, hideWalletConnect = false } = props;

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const autocompleteInputRef = useRef<HTMLInputElement | null>(null);

    const [displayActionComposer, setDisplayActionComposer] = useState(false);

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
            onAddAction({ ...defaultValue, id: actionId, daoId, meta });
        } else if (id === ActionItemId.ADD_CONTRACT) {
            handleVerifySmartContract(inputValue);
        }
    };

    return (
        <>
            <div className={classNames('flex flex-row gap-3', { hidden: displayActionComposer })}>
                <Button variant="primary" size="md" iconLeft={IconType.PLUS} onClick={handleAddAction}>
                    {t('app.shared.actionComposer.addAction.default')}
                </Button>
                {!hideWalletConnect && (
                    <Button
                        variant="secondary"
                        size="md"
                        iconRight={IconType.BLOCKCHAIN_WALLETCONNECT}
                        onClick={displayWalletConnectDialog}
                    >
                        {t('app.shared.actionComposer.addAction.walletConnect')}
                    </Button>
                )}
            </div>
            <ActionComposerInput
                wrapperClassName={classNames('transition-none', { '!sr-only': !displayActionComposer })}
                onActionSelected={handleItemSelected}
                onOpenChange={setDisplayActionComposer}
                ref={autocompleteInputRef}
                nativeItems={nativeItems}
                nativeGroups={nativeGroups}
                daoId={daoId}
                importedContractAbis={importedContractAbis}
            />
        </>
    );
};
