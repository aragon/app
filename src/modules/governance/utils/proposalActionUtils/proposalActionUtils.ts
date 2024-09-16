import {
    ProposalActionType,
    type IProposal,
    type IProposalAction,
    type IProposalActionChangeMembers,
    type IProposalActionChangeSettings,
    type IProposalActionTokenMint,
    type IProposalActionUpdateMetadata,
    type IProposalActionWithdrawToken,
} from '@/modules/governance/api/governanceService';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import type { IDaoSettingTermAndDefinition, IUseGovernanceSettingsParams } from '@/modules/settings/types';
import { type IDaoLink } from '@/shared/api/daoService';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import {
    ProposalActionType as OdsProposalActionType,
    type IProposalAction as IOdsProposalAction,
    type IProposalActionChangeMembers as IOdsProposalActionChangeMembers,
    type IProposalActionChangeSettings as IOdsProposalActionChangeSettings,
    type IProposalActionTokenMint as IOdsProposalActionTokenMint,
    type IProposalActionUpdateMetadata as IOdsProposalActionUpdateMetadata,
    type IProposalActionWithdrawToken as IOdsProposalActionWithdrawToken,
    type IProposalActionUpdateMetadataDaoMetadataLink,
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
    actions: IProposalAction[];
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

    normalizeActions = (params: INormalizeActionsParams): IOdsProposalAction[] => {
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

    normalizeTransferAction = (action: IProposalActionWithdrawToken): IOdsProposalActionWithdrawToken => {
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
    ): IOdsProposalActionChangeSettings => {
        const { type, proposedSettings, ...otherValues } = action;
        const { settings: existingSettings } = proposal;

        const parsingFunction = pluginRegistryUtils.getSupportedSlotFunction<
            IUseGovernanceSettingsParams,
            IDaoSettingTermAndDefinition[]
        >({
            pluginIds: pluginIds,
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

    normalizeChangeMembersAction = (action: IProposalActionChangeMembers): IOdsProposalActionChangeMembers => {
        const { type, currentMembers, ...otherValues } = action;

        return {
            ...otherValues,
            type: this.actionTypeMapping[type],
            currentMembers: currentMembers.length,
        };
    };

    normalizeUpdateMetaDataAction = (action: IProposalActionUpdateMetadata): IOdsProposalActionUpdateMetadata => {
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

    normalizeTokenMintAction = (action: IProposalActionTokenMint): IOdsProposalActionTokenMint => {
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

    isWithdrawTokenAction = (action: Partial<IProposalAction>): action is IProposalActionWithdrawToken => {
        return action.type === ProposalActionType.TRANSFER;
    };

    isChangeMembersAction = (action: Partial<IProposalAction>): action is IProposalActionChangeMembers => {
        return (
            action.type === ProposalActionType.MULTISIG_ADD_MEMBERS ||
            action.type === ProposalActionType.MULTISIG_REMOVE_MEMBERS
        );
    };

    isUpdateMetadataAction = (action: Partial<IProposalAction>): action is IProposalActionUpdateMetadata => {
        return action.type === ProposalActionType.METADATA_UPDATE;
    };

    isTokenMintAction = (action: Partial<IProposalAction>): action is IProposalActionTokenMint => {
        return action.type === ProposalActionType.MINT;
    };

    isChangeSettingsAction = (action: Partial<IProposalAction>): action is IProposalActionChangeSettings => {
        return (
            action.type === ProposalActionType.UPDATE_MULTISIG_SETTINGS ||
            action.type === ProposalActionType.UPDATE_VOTE_SETTINGS
        );
    };
}

export const proposalActionUtils = new ProposalActionUtils();
