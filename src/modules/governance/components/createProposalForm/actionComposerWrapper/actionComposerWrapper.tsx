import { type IProposalAction } from '@/modules/governance/api/governanceService';
import type { ISmartContractAbi } from '@/modules/governance/api/smartContractService';
import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { IVerifySmartContractDialogParams } from '@/modules/governance/dialogs/verifySmartContractDialog';
import type { IWalletConnectActionDialogParams } from '@/modules/governance/dialogs/walletConnectActionDialog';
import type { IActionComposerPluginData } from '@/modules/governance/types';
import { type IDaoPlugin, useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { Button, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import { ActionComposer, type IActionComposerItem } from '../../actionComposer';
import { ActionItemId } from '../../actionComposer/actionComposerUtils';
import { useActionsContext } from '../actionsProvider';
import type { IProposalActionData } from '../createProposalFormDefinitions';

export interface IActionComposerWrapperProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
    onAddAction: (value: IProposalActionData | IProposalActionData[]) => void;
    // actionOperations: {
    //     addAction: (value: FieldArray<IProposalActionData> | IProposalActionData | IProposalActionData[]) => void;
    //     removeAction: (index: number) => void;
    //     moveAction: (index: number, newIndex: number) => void;
    //     actions: IProposalActionData[];
    // };
}

// const coreCustomActionComponents = {
//     [ProposalActionType.TRANSFER]: TransferAssetAction,
//     [ProposalActionType.METADATA_UPDATE]: UpdateDaoMetadataAction,
//     [ProposalActionType.METADATA_PLUGIN_UPDATE]: UpdatePluginMetadataAction,
// } as unknown as Record<string, ProposalActionComponent<IProposalActionData>>;

export const ActionComposerWrapper: React.FC<IActionComposerWrapperProps> = (props) => {
    const { daoId, onAddAction } = props;

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { addSmartContractAbi } = useActionsContext();

    const autocompleteInputRef = useRef<HTMLInputElement | null>(null);

    const [displayActionComposer, setDisplayActionComposer] = useState(false);
    // const [expandedActions, setExpandedActions] = useState<string[]>([]);

    // const { addAction, removeAction, moveAction, actions } = actionOperations;

    // Needed to control the entire field array (see Controlled Field Array on useFieldArray)
    // TODO: move to parent
    // const watchFieldArray = useWatch<Record<string, ICreateProposalFormData['actions']>>({ name: 'actions' });
    // const controlledActions = actions.map((field, index) => ({ ...field, ...watchFieldArray[index] }));

    // When moving actions up or down, the value field of the decoded parameters does not get unregistered, causing
    // actions to have redundant parameters (coming from the action before/after) with a value but no type or name.
    // const processedActions = controlledActions.map(({ inputData, ...field }) => ({
    //     ...field,
    //     inputData: inputData
    //         ? { ...inputData, parameters: inputData.parameters.filter(({ type }) => (type as unknown) != null) }
    //         : null,
    // }));

    const handleAddAction = () => {
        autocompleteInputRef.current?.focus();
    };

    const handleAbiSubmit = (abi: ISmartContractAbi) => {
        addSmartContractAbi(abi);
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

    const handleItemSelected = (action: IActionComposerItem, inputValue: string) => {
        const { id, defaultValue, meta } = action;

        if (defaultValue != null) {
            const actionId = crypto.randomUUID();
            onAddAction({ ...defaultValue, id: actionId, daoId, meta });
            // setExpandedActions([actionId]);
        } else if (id === ActionItemId.ADD_CONTRACT) {
            handleVerifySmartContract(inputValue);
        }
    };

    // const handleMoveAction = (index: number, newIndex: number) => moveAction(index, newIndex);
    //
    // const handleRemoveAction = (action: IProposalActionData, index: number) => {
    //     removeAction(index);
    //     setExpandedActions((actionIds) => {
    //         // Expand the last remaining actions when only two actions are left, otherwise exclude the removed action ID
    //         const defaultNewIds = actionIds.filter((id) => id !== action.id);
    //         const newExpandedActions = actions.length === 2 ? [actions[Math.abs(index - 1)].id] : defaultNewIds;
    //
    //         return newExpandedActions;
    //     });
    // };

    // const getActionDropdownItems = (index: number) => {
    //     const dropdownItems: Array<IProposalActionsItemDropdownItem<IProposalActionData> & { hidden: boolean }> = [
    //         {
    //             label: t('app.governance.createProposalForm.actions.editAction.up'),
    //             icon: IconType.CHEVRON_UP,
    //             onClick: (_, index) => handleMoveAction(index, index - 1),
    //             hidden: actions.length < 2 || index === 0,
    //         },
    //         {
    //             label: t('app.governance.createProposalForm.actions.editAction.down'),
    //             icon: IconType.CHEVRON_DOWN,
    //             onClick: (_, index) => handleMoveAction(index, index + 1),
    //             hidden: actions.length < 2 || index === actions.length - 1,
    //         },
    //         {
    //             label: t('app.governance.createProposalForm.actions.editAction.remove'),
    //             icon: IconType.CLOSE,
    //             onClick: handleRemoveAction,
    //             hidden: false,
    //         },
    //     ];
    //
    //     return dropdownItems.filter((item) => !item.hidden);
    // };

    const pluginActions =
        dao?.plugins.map((plugin) =>
            pluginRegistryUtils.getSlotFunction<IDaoPlugin, IActionComposerPluginData>({
                pluginId: plugin.subdomain,
                slotId: GovernanceSlotId.GOVERNANCE_PLUGIN_ACTIONS,
            })?.(plugin),
        ) ?? [];

    const pluginItems = pluginActions.flatMap((data) => data?.items ?? []);
    const pluginGroups = pluginActions.flatMap((data) => data?.groups ?? []);
    // const pluginComponents = pluginActions.reduce((acc, data) => ({ ...acc, ...data?.components }), {});

    // const customActionComponents: Record<string, ProposalActionComponent<IProposalActionData>> = {
    //     ...coreCustomActionComponents,
    //     ...pluginComponents,
    // };

    return (
        // <div className="flex flex-col gap-y-10">
        <>
            {/*<ProposalActions.Root expandedActions={expandedActions} onExpandedActionsChange={setExpandedActions}>*/}
            {/*    <ProposalActions.Container emptyStateDescription="">*/}
            {/*        {actions.map((action, index) => (*/}
            {/*            <ProposalActions.Item<IProposalActionData>*/}
            {/*                key={action.id}*/}
            {/*                action={action}*/}
            {/*                value={action.id}*/}
            {/*                CustomComponent={customActionComponents[action.type]}*/}
            {/*                dropdownItems={getActionDropdownItems(index)}*/}
            {/*                editMode={true}*/}
            {/*                formPrefix={`actions.${index.toString()}`}*/}
            {/*                chainId={networkDefinitions[dao!.network].id}*/}
            {/*            />*/}
            {/*        ))}*/}
            {/*    </ProposalActions.Container>*/}
            {/*</ProposalActions.Root>*/}
            <div className={classNames('flex flex-row gap-3', { hidden: displayActionComposer })}>
                <Button variant="primary" size="md" iconLeft={IconType.PLUS} onClick={() => handleAddAction()}>
                    {t('app.governance.createProposalForm.actions.addAction.default')}
                </Button>
                <Button
                    variant="secondary"
                    size="md"
                    iconRight={IconType.BLOCKCHAIN_WALLETCONNECT}
                    onClick={displayWalletConnectDialog}
                >
                    {t('app.governance.createProposalForm.actions.addAction.walletConnect')}
                </Button>
            </div>
            <ActionComposer
                wrapperClassName={classNames('transition-none', { '!sr-only': !displayActionComposer })}
                onActionSelected={handleItemSelected}
                onOpenChange={setDisplayActionComposer}
                ref={autocompleteInputRef}
                nativeItems={pluginItems}
                nativeGroups={pluginGroups}
                daoId={daoId}
            />
        </>
        // </div>
    );
};
