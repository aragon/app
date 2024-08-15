import {
    ProposalActionType,
    type IProposal,
    type IProposalActionChangeMembers,
    type IProposalActionChangeSettings,
    type IProposalActionTokenMint,
    type IProposalActionUpdateMetadata,
    type IProposalActionWithdrawToken,
} from '@/modules/governance/api/governanceService';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { type IDaoLink } from '@/shared/api/daoService';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import {
    ProposalActionType as OdsProposalActionType,
    type IProposalActionUpdateMetadataDaoMetadataLink,
    type IProposalAction as OdsIProposalAction,
    type IProposalActionChangeMembers as OdsIProposalActionChangeMembers,
    type IProposalActionChangeSettings as OdsIProposalActionChangeSettings,
    type IProposalActionTokenMint as OdsIProposalActionTokenMint,
    type IProposalActionUpdateMetadata as OdsIProposalActionUpdateMetadata,
    type IProposalActionWithdrawToken as OdsIProposalActionWithdrawToken,
} from '@aragon/ods';
import { formatUnits } from 'viem';

export interface INormalizeActionsParams {
    /**
     * List of plugins for the DAO.
     */
    pluginIds: string[];
    /**
     * List of fetched actions in the proposal.
     */
    actions: OdsIProposalAction[];
    /**
     * The proposal object with full data.
     */
    proposal: IProposal;
    /**
     * The DAO ID.
     */
    daoId: string;
}

class ProposalActionUtils {
    actionTypeMapping = {
        [ProposalActionType.TRANSFER]: OdsProposalActionType.WITHDRAW_TOKEN,
        [ProposalActionType.MINT]: OdsProposalActionType.TOKEN_MINT,
        [ProposalActionType.MULTISIG_ADD_MEMBERS]: OdsProposalActionType.ADD_MEMBERS,
        [ProposalActionType.MULTISIG_REMOVE_MEMBERS]: OdsProposalActionType.REMOVE_MEMBERS,
        [ProposalActionType.METADATA_UPDATE]: OdsProposalActionType.UPDATE_METADATA,
        [ProposalActionType.UPDATE_MULTISIG_SETTINGS]: OdsProposalActionType.CHANGE_SETTINGS_MULTISIG,
        [ProposalActionType.UPDATE_VOTE_SETTINGS]: OdsProposalActionType.CHANGE_SETTINGS_TOKENVOTE,
    } as const;

    normalizeActions = (params: INormalizeActionsParams): OdsIProposalAction[] => {
        const { pluginIds, actions, proposal, daoId } = params;

        return actions.map((action) => {
            if (this.isWithdrawTokenAction(action)) {
                return this.normalizeTransferAction(action);
            }
            if (this.isChangeSettingsAction(action)) {
                return this.normalizeChangeSettingsAction(action, pluginIds, proposal, daoId);
            }
            if (this.isChangeMembersAction(action)) {
                return this.normalizeChangeMembersAction(action);
            }
            if (this.isUpdateMetadataAction(action)) {
                return this.normalizeUpdateMetaDataAction(action);
            }
            if (this.isTokenMintAction(action)) {
                return this.normalizeTokenMintAction(action);
            }

            return action;
        });
    };

    normalizeTransferAction = (action: IProposalActionWithdrawToken): OdsIProposalActionWithdrawToken => {
        const { amount, token, ...otherValues } = action;

        return {
            ...otherValues,
            type: this.actionTypeMapping[action.type],
            token,
            amount: formatUnits(BigInt(amount), token.decimals),
        };
    };

    normalizeChangeSettingsAction = (
        action: IProposalActionChangeSettings,
        pluginIds: string[],
        proposal: IProposal,
        daoId: string,
    ): OdsIProposalActionChangeSettings => {
        const { type, proposedSettings, ...otherValues } = action;
        const { settings: existingSettings } = proposal;
        const supportedPlugin = pluginIds.find((id) => pluginRegistryUtils.getPlugin(id) != null);

        const parsingFunction = pluginRegistryUtils.getSlotFunction({
            pluginId: supportedPlugin!,
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
        })!;

        const completeProposedSettings = { ...existingSettings, ...proposedSettings };

        // TODO: remove custom settings object and plugin-specific logic when settings interface is cleaned up (APP-3483)
        const settingsObjectExisting = {
            settings: existingSettings,
            token: (proposal as unknown as Record<string, unknown>).token,
        };
        const settingsObjectProposed = {
            settings: completeProposedSettings,
            token: (proposal as unknown as Record<string, unknown>).token,
        };

        const parsedExistingSettings = parsingFunction({ settings: settingsObjectExisting, daoId });
        const parsedProposedSettings = parsingFunction({ settings: settingsObjectProposed, daoId });

        return {
            ...otherValues,
            type: this.actionTypeMapping[type],
            existingSettings: parsedExistingSettings,
            proposedSettings: parsedProposedSettings,
        };
    };

    normalizeChangeMembersAction = (action: IProposalActionChangeMembers): OdsIProposalActionChangeMembers => {
        const { type, currentMembers, ...otherValues } = action;

        return {
            ...otherValues,
            type: this.actionTypeMapping[type],
            currentMembers: currentMembers.length,
        };
    };

    normalizeUpdateMetaDataAction = (action: IProposalActionUpdateMetadata): OdsIProposalActionUpdateMetadata => {
        const { type, proposedMetadata, existingMetadata, ...otherValues } = action;

        const normalizeLinks = (links: IDaoLink[]): IProposalActionUpdateMetadataDaoMetadataLink[] =>
            links.map((link: IDaoLink) => ({ label: link.name, href: link.url }));

        return {
            ...otherValues,
            type: this.actionTypeMapping[type],
            proposedMetadata: {
                ...proposedMetadata,
                links: normalizeLinks(proposedMetadata.links),
            },
            existingMetadata: {
                ...existingMetadata,
                links: normalizeLinks(existingMetadata.links),
            },
        };
    };

    normalizeTokenMintAction = (action: IProposalActionTokenMint): OdsIProposalActionTokenMint => {
        const { token, receivers, ...otherValues } = action;
        const { currentBalance, newBalance, ...otherReceiverValues } = receivers;

        return {
            ...otherValues,
            type: this.actionTypeMapping[action.type],
            tokenSymbol: token.symbol,
            receiver: {
                ...otherReceiverValues,
                currentBalance: formatUnits(BigInt(currentBalance), token.decimals),
                newBalance: formatUnits(BigInt(newBalance), token.decimals),
            },
        };
    };

    isWithdrawTokenAction = (action: Partial<OdsIProposalAction>): action is IProposalActionWithdrawToken => {
        return action.type === ProposalActionType.TRANSFER;
    };

    isChangeMembersAction = (action: Partial<OdsIProposalAction>): action is IProposalActionChangeMembers => {
        return (
            action.type === ProposalActionType.MULTISIG_ADD_MEMBERS ||
            action.type === ProposalActionType.MULTISIG_REMOVE_MEMBERS
        );
    };

    isUpdateMetadataAction = (action: Partial<OdsIProposalAction>): action is IProposalActionUpdateMetadata => {
        return action.type === ProposalActionType.METADATA_UPDATE;
    };

    isTokenMintAction = (action: Partial<OdsIProposalAction>): action is IProposalActionTokenMint => {
        return action.type === ProposalActionType.MINT;
    };

    isChangeSettingsAction = (action: Partial<OdsIProposalAction>): action is IProposalActionChangeSettings => {
        return (
            action.type === ProposalActionType.UPDATE_MULTISIG_SETTINGS ||
            action.type === ProposalActionType.UPDATE_VOTE_SETTINGS
        );
    };
}

export const proposalActionUtils = new ProposalActionUtils();
