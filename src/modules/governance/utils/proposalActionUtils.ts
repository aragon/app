import { type IProposal } from '@/modules/governance/api/governanceService';
import { ProposalActionType } from '@/modules/governance/api/governanceService';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { type IDaoLink } from '@/shared/api/daoService';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import {
    type IProposalAction,
    type IProposalActionChangeMembers,
    type IProposalActionChangeSettings,
    type IProposalActionTokenMint,
    type IProposalActionUpdateMetadata,
    type IProposalActionUpdateMetadataDaoMetadataLink,
    type IProposalActionWithdrawToken,
    proposalActionsUtils as OdsProposalActionUtils,
    ProposalActionType as OdsProposalActionType,
} from '@aragon/ods';
import { formatUnits } from 'viem';

interface INormalizeActionsParams {
    /**
     * List of plugins for the DAO.
     */
    plugins: string[];
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
    actionTypeMapping: Record<ProposalActionType, OdsProposalActionType> = {
        [ProposalActionType.TRANSFER]: OdsProposalActionType.WITHDRAW_TOKEN,
        [ProposalActionType.MINT]: OdsProposalActionType.TOKEN_MINT,
        [ProposalActionType.MULTISIG_ADD_MEMBERS]: OdsProposalActionType.ADD_MEMBERS,
        [ProposalActionType.MULTISIG_REMOVE_MEMBERS]: OdsProposalActionType.REMOVE_MEMBERS,
        [ProposalActionType.METADATA_UPDATE]: OdsProposalActionType.UPDATE_METADATA,
        [ProposalActionType.UPDATE_MULTISIG_SETTINGS]: OdsProposalActionType.CHANGE_SETTINGS_MULTISIG,
        [ProposalActionType.UPDATE_VOTE_SETTINGS]: OdsProposalActionType.CHANGE_SETTINGS_TOKENVOTE,
    };

    normalizeActions = (
       params: INormalizeActionsParams,
    ): IProposalAction[] => {
        const { plugins, actions, proposal, daoId } = params;

        return actions.map((action) => {
            const mappedType = this.actionTypeMapping[action.type as ProposalActionType];
            const normalizedAction = { ...action, type: mappedType };

            if (OdsProposalActionUtils.isWithdrawTokenAction(normalizedAction)) {
                return this.normalizeTransferAction(normalizedAction);
            }
            if (OdsProposalActionUtils.isChangeSettingsAction(normalizedAction)) {
                return this.normalizeChangeSettingsAction(normalizedAction, plugins, proposal, daoId);
            }
            if (OdsProposalActionUtils.isChangeMembersAction(normalizedAction)) {
                return this.normalizeChangeMembersAction(normalizedAction);
            }
            if (OdsProposalActionUtils.isUpdateMetadataAction(normalizedAction)) {
                /**
                 * TODO remove type assertion (and mapping below) when ODS Interface for IProposalActionUpdateMetadataDaoMetadataLink is updated (APP-3505)
                 * Check whether normalizer for UpdateMetadataAction is needed
                 */
                return this.normalizeUpdateMetaDataAction(
                    normalizedAction as IProposalActionUpdateMetadata & {
                        proposedMetadata: { links: IDaoLink[] };
                        existingMetadata: { links: IDaoLink[] };
                    },
                );
            }

            return {
                ...normalizedAction,
                type: mappedType,
            };
        });
    };

    normalizeTransferAction = (action: IProposalActionWithdrawToken): IProposalActionWithdrawToken => {
        const { amount, token, ...otherValues } = action;

        return {
            token,
            amount: formatUnits(BigInt(amount), token.decimals),
            ...otherValues,
        };
    };

    normalizeChangeSettingsAction = (
        action: IProposalActionChangeSettings,
        plugins: string[],
        proposal: IProposal,
        daoId: string,
    ): IProposalActionChangeSettings => {
        const { proposedSettings, ...otherValues } = action;
        const { settings: existingSettings } = proposal;

        const parsingFunction = pluginRegistryUtils.getSlotFunction({
            pluginId: plugins[0],
            slotId: SettingsSlotId.SETTINGS_GOVERNANCE_SETTINGS_HOOK,
        });

        const completeProposedSettings = {...existingSettings as IProposalActionChangeSettings[], ...proposedSettings};
        
        // TODO: remove settings objects and deepMerge helper when settings interface is cleaned up (APP-3483)
        const settingsObjectExisting = {
            settings: existingSettings,
            token: (proposal as unknown as Record<string, unknown>).token,
        };
        const settingsObjectProposed = {
            settings: completeProposedSettings,
            token: (proposal as unknown as Record<string, unknown>).token,
        };

        const parsedExistingSettings = parsingFunction && parsingFunction({ settings: settingsObjectExisting, daoId });
        const parsedProposedSettings =
            parsingFunction && parsingFunction({ settings: settingsObjectProposed, daoId });

        if (parsedProposedSettings && parsedExistingSettings) {
            return {
                ...otherValues,
                existingSettings: parsedExistingSettings,
                proposedSettings: parsedProposedSettings,
            };
        }

        return action;
    };

    normalizeChangeMembersAction = (action: IProposalActionChangeMembers): IProposalActionChangeMembers => {
        const { currentMembers, ...otherValues } = action;

        return {
            ...otherValues,
            currentMembers: Array.isArray(currentMembers) ? currentMembers.length : currentMembers,
        };
    };

    normalizeUpdateMetaDataAction = (
        action: IProposalActionUpdateMetadata & {
            proposedMetadata: { links: IDaoLink[] };
            existingMetadata: { links: IDaoLink[] };
        },
    ): IProposalActionUpdateMetadata => {
        const { proposedMetadata, existingMetadata, ...otherValues } = action;

        const mapLinks = (links: IDaoLink[]): IProposalActionUpdateMetadataDaoMetadataLink[] => {
            return links.map((link: IDaoLink) => ({
                label: link.name,
                href: link.url,
            }));
        };
        return {
            ...otherValues,
            proposedMetadata: {
                ...proposedMetadata,
                links: mapLinks(proposedMetadata.links),
            },
            existingMetadata: {
                ...existingMetadata,
                links: mapLinks(existingMetadata.links),
            },
        };
    };

    normalizeTokenMintAction = (action: IProposalActionTokenMint): IProposalActionTokenMint => {  
        const { receivers, ...otherValues } = action;
    
        return {
            ...otherValues,
            receivers: [...receivers]
        };
    }

}

const proposalActionUtils = new ProposalActionUtils();

export default proposalActionUtils;
