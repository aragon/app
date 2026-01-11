import {
    ProposalActionType as GukProposalActionType,
    type IProposalAction as IGukProposalAction,
    type IProposalActionUpdateMetadata as IGukProposalActionUpdateMetadata,
    type IProposalActionWithdrawToken as IGukProposalActionWithdrawToken,
    type IProposalActionUpdateMetadataDaoMetadata,
    type IProposalActionUpdateMetadataDaoMetadataLink,
} from '@aragon/gov-ui-kit';
import {
    type AbiStateMutability,
    formatUnits,
    type Hex,
    toFunctionSelector,
} from 'viem';
import {
    type IProposalAction,
    type IProposalActionUpdateMetadata,
    type IProposalActionUpdateMetadataObject,
    type IProposalActionUpdatePluginMetadata,
    type IProposalActionUpdatePluginMetadataObject,
    type IProposalActionWithdrawToken,
    ProposalActionType,
} from '@/modules/governance/api/governanceService';
import type { IResource } from '@/shared/api/daoService';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import type { INormalizeActionsParams } from '../../types';

class ProposalActionUtils {
    normalizeActions = (
        actions: IProposalAction[],
        daoId: string,
    ): IGukProposalAction[] => {
        // Use all registered normalization functions to make sure we render the native action correctly even if a DAO
        // does not have the related plugin (e.g. a Multisig DAO updating the settings of a Token-based DAO)
        const normalizeFunctions = pluginRegistryUtils.getSlotFunctions<
            INormalizeActionsParams,
            IProposalAction[]
        >(GovernanceSlotId.GOVERNANCE_PLUGIN_NORMALIZE_ACTIONS);

        const pluginNormalizedActions = normalizeFunctions.reduce(
            (current, normalizeFunction) =>
                normalizeFunction({ actions: current, daoId }),
            actions,
        );

        return pluginNormalizedActions.map((action) =>
            this.normalizeDefaultAction(action),
        );
    };

    normalizeDefaultAction = (action: IProposalAction): IGukProposalAction => {
        if (this.isWithdrawTokenAction(action)) {
            return this.normalizeTransferAction(action);
        }
        if (this.isUpdateMetadataAction(action)) {
            return this.normalizeUpdateMetaDataAction(action);
        }

        return action;
    };

    normalizeTransferAction = (
        action: IProposalActionWithdrawToken,
    ): IGukProposalActionWithdrawToken => {
        const { amount, token, ...otherValues } = action;
        const parsedAmount = formatUnits(BigInt(amount), token.decimals);

        return {
            ...otherValues,
            type: GukProposalActionType.WITHDRAW_TOKEN,
            token,
            amount: parsedAmount,
        };
    };

    normalizeUpdateMetaDataAction = (
        action:
            | IProposalActionUpdateMetadata
            | IProposalActionUpdatePluginMetadata,
    ): IGukProposalActionUpdateMetadata => {
        const { type, proposedMetadata, existingMetadata, ...otherValues } =
            action;

        const isPluginMetadata =
            type === ProposalActionType.METADATA_PLUGIN_UPDATE;
        const processedType = isPluginMetadata
            ? GukProposalActionType.UPDATE_PLUGIN_METADATA
            : GukProposalActionType.UPDATE_METADATA;

        return {
            ...otherValues,
            type: processedType,
            proposedMetadata: this.normalizeActionMetadata(proposedMetadata),
            existingMetadata: this.normalizeActionMetadata(existingMetadata),
        };
    };

    normalizeActionMetadata = (
        metadata:
            | IProposalActionUpdateMetadataObject
            | IProposalActionUpdatePluginMetadataObject,
    ): IProposalActionUpdateMetadataDaoMetadata => ({
        ...metadata,
        name: metadata.name ?? '',
        description: metadata.description ?? '',
        links: this.normalizeActionMetadataLinks(metadata.links),
        avatar: this.normalizeActionMetadataAvatar(metadata),
    });

    normalizeActionMetadataAvatar = (
        metadata:
            | IProposalActionUpdateMetadataObject
            | IProposalActionUpdatePluginMetadataObject,
    ): string | undefined =>
        'avatar' in metadata && metadata.avatar != null
            ? ipfsUtils.cidToSrc(metadata.avatar)
            : undefined;

    normalizeActionMetadataLinks = (
        links: IResource[] = [],
    ): IProposalActionUpdateMetadataDaoMetadataLink[] =>
        links.map(({ name, url }) => ({ label: name, href: url }));

    isWithdrawTokenAction = (
        action: Partial<IProposalAction>,
    ): action is IProposalActionWithdrawToken =>
        action.type === ProposalActionType.TRANSFER ||
        action.type === ProposalActionType.TRANSFER_NATIVE;

    isUpdateMetadataAction = (
        action: Partial<IProposalAction>,
    ): action is IProposalActionUpdateMetadata =>
        action.type === ProposalActionType.METADATA_UPDATE ||
        action.type === ProposalActionType.METADATA_PLUGIN_UPDATE;

    actionToFunctionSelector = (action: IProposalAction): Hex | undefined => {
        const { inputData, data } = action;
        const isNativeTransfer = data === '0x';

        if (inputData == null || isNativeTransfer) {
            return;
        }

        const {
            function: actionFunction,
            parameters,
            stateMutability,
        } = inputData;

        // Parameters might be undefined at runtime despite type definitions
        const actionParameters = parameters as typeof parameters | undefined;
        if (!actionParameters) {
            return;
        }

        const functionSelector = toFunctionSelector({
            type: 'function',
            name: actionFunction,
            inputs: actionParameters,
            outputs: [],
            stateMutability: stateMutability as AbiStateMutability,
        });

        return functionSelector;
    };
}

export const proposalActionUtils = new ProposalActionUtils();
