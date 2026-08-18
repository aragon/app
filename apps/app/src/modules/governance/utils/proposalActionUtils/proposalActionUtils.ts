import {
    addressUtils,
    ProposalActionType as GukProposalActionType,
    type IProposalAction as IGukProposalAction,
    type IProposalActionUpdateMetadata as IGukProposalActionUpdateMetadata,
    type IProposalActionWithdrawToken as IGukProposalActionWithdrawToken,
    type IProposalActionUpdateMetadataDaoMetadata,
    type IProposalActionUpdateMetadataDaoMetadataLink,
    ProposalActionTypeNoBasicView,
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
import type { IDao, IResource } from '@/shared/api/daoService';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import type { INormalizeActionsParams, IRawActionTuple } from '../../types';

class ProposalActionUtils {
    /**
     * Builds raw-calldata stubs out of a raw actions tuple, used as a fallback view when the decoded sub-actions of a
     * wrapper action are missing or out of sync with the tuple.
     */
    buildRawActionStubs = (tuple: IRawActionTuple[]): IProposalAction[] =>
        tuple.map((entry) => ({
            from: '',
            to: entry.to,
            data: entry.data,
            value: entry.value,
            type: ProposalActionTypeNoBasicView.RAW_CALLDATA,
            inputData: null,
        }));

    /**
     * Compares two native-currency amounts written as strings, tolerating a difference in notation between the decoded
     * action and the calldata it was decoded from (hex vs decimal, leading zeros). Falls back to an exact comparison
     * when either side is not a number at all, so an unparseable amount counts as a mismatch rather than a match.
     * @param value - Amount of the decoded action.
     * @param otherValue - Amount carried by the raw tuple.
     * @returns True when both amounts are the same.
     */
    isSameActionValue = (value: string, otherValue: string): boolean => {
        try {
            return BigInt(value) === BigInt(otherValue);
        } catch {
            return value === otherValue;
        }
    };

    /**
     * Checks that a decoded action describes the same call as the raw tuple entry it was decoded from. The two come
     * from different sources - the backend decodes the action, the app reads the tuple out of the calldata - so
     * addresses and calldata are compared case-insensitively and the value numerically.
     * @param action - The decoded action.
     * @param rawEntry - The raw tuple entry at the same position.
     * @returns True when the action matches the tuple entry.
     */
    isSameAction = (
        action: IProposalAction,
        rawEntry: IRawActionTuple,
    ): boolean =>
        addressUtils.isAddressEqual(action.to, rawEntry.to) &&
        action.data.toLowerCase() === rawEntry.data.toLowerCase() &&
        this.isSameActionValue(action.value, rawEntry.value);

    /**
     * Resolves the sub-actions of a wrapper action to render, falling back to raw-calldata stubs built from `rawTuple`
     * when the decoded `subActions` are missing or do not describe the same calls as the tuple. Matching the count
     * alone is not enough: the tuple is what actually executes, so a decoded action that names a different target,
     * value or calldata must never be shown in its place.
     */
    resolveNestedActions = (
        subActions: IProposalAction[] | undefined,
        rawTuple: IRawActionTuple[],
    ): IProposalAction[] => {
        const matchesRawTuple =
            subActions != null &&
            subActions.length === rawTuple.length &&
            subActions.every((action, index) =>
                this.isSameAction(action, rawTuple[index]),
            );

        return matchesRawTuple
            ? subActions
            : this.buildRawActionStubs(rawTuple);
    };

    normalizeActions = (
        actions: IProposalAction[],
        dao: IDao,
    ): IGukProposalAction[] => {
        // Use all registered normalization functions to make sure we render the native action correctly even if a DAO
        // does not have the related plugin (e.g. a Multisig DAO updating the settings of a Token-based DAO)
        const normalizeFunctions = pluginRegistryUtils.getSlotFunctions<
            INormalizeActionsParams,
            IProposalAction[]
        >(GovernanceSlotId.GOVERNANCE_PLUGIN_NORMALIZE_ACTIONS);

        const pluginNormalizedActions = normalizeFunctions.reduce(
            (current, normalizeFunction) =>
                normalizeFunction({ actions: current, daoId: dao.id }),
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
