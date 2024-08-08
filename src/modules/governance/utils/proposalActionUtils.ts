import { type IProposal } from '@/modules/governance/api/governanceService';
import { ProposalActionType } from '@/modules/governance/api/governanceService/domain/enum/proposalActionType';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { type IDaoLink } from '@/shared/api/daoService';
import { deepMerge } from '@/shared/utils/helpers/deepMerge';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils/pluginRegistryUtils';
import {
    type IProposalAction,
    type IProposalActionChangeMembers,
    type IProposalActionChangeSettings,
    type IProposalActionUpdateMetadata,
    type IProposalActionUpdateMetadataDaoMetadataLink,
    type IProposalActionWithdrawToken,
    proposalActionsUtils as ODSProposalActionUtils,
    ProposalActionType as ProposalActionTypeODS,
} from '@aragon/ods';
import { formatUnits, hexToBigInt } from 'viem';

class ProposalActionUtils {
    actionTypeMapping: { [key in ProposalActionType]: ProposalActionTypeODS } = {
        [ProposalActionType.Transfer]: ProposalActionTypeODS.WITHDRAW_TOKEN,
        [ProposalActionType.Mint]: ProposalActionTypeODS.TOKEN_MINT,
        [ProposalActionType.MultisigAddMembers]: ProposalActionTypeODS.ADD_MEMBERS,
        [ProposalActionType.MultisigRemoveMembers]: ProposalActionTypeODS.REMOVE_MEMBERS,
        [ProposalActionType.MetadataUpdate]: ProposalActionTypeODS.UPDATE_METADATA,
        [ProposalActionType.UpdateMultiSigSettings]: ProposalActionTypeODS.CHANGE_SETTINGS_MULTISIG,
        [ProposalActionType.UpdateVoteSettings]: ProposalActionTypeODS.CHANGE_SETTINGS_TOKENVOTE,
    };

    normalizeActions = (
        plugins: string[],
        fetchedActions: IProposalAction[],
        proposal: IProposal,
        daoId: string,
    ): IProposalAction[] => {
        return fetchedActions.map((action) => {
            const mappedType = this.actionTypeMapping[action.type as ProposalActionType];
            const normalizedAction = { ...action, type: mappedType };
            console.log('fetchedAction', action);   
            console.log('normalizedAction', normalizedAction);
            console.log('proposal', proposal);

            if (ODSProposalActionUtils.isWithdrawTokenAction(normalizedAction)) {
                return this.normalizeTransferAction(normalizedAction);
            }
            if (ODSProposalActionUtils.isChangeSettingsAction(normalizedAction)) {
                return this.normalizeChangeSettingsAction(normalizedAction, plugins, proposal, daoId);
            }
            if (ODSProposalActionUtils.isChangeMembersAction(normalizedAction)) {
                return this.normalizeChangeMembersAction(normalizedAction);
            }
            if (ODSProposalActionUtils.isUpdateMetadataAction(normalizedAction)) {
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
        // Convert hex string to BigInt
        const bigIntValue = BigInt(amount);
        console.log('BigInt value:', bigIntValue.toString());

        // For further precision formatting, you can divide or manipulate the BigInt
        const decimals = 18;
        const factor = BigInt(6 ** 16);
        const formattedValue = bigIntValue / factor;
        console.log('Formatted BigInt value:', formattedValue.toString());

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

        // TODO: remove settings objects and deepMerge helper when settings interface is cleaned up (APP-3483)
        const settingsObjectExisting = {
            settings: existingSettings,
            token: (proposal as unknown as Record<string, unknown>).token,
        };
        const settingsObjectProposed = {
            settings: proposedSettings,
            token: (proposal as unknown as Record<string, unknown>).token,
        };
        const completedSettingsObjectProposed = deepMerge(settingsObjectExisting, settingsObjectProposed);

        const parsedExistingSettings = parsingFunction && parsingFunction({ settings: settingsObjectExisting, daoId });
        const parsedProposedSettings =
            parsingFunction && parsingFunction({ settings: completedSettingsObjectProposed, daoId });

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
}

const proposalActionUtils = new ProposalActionUtils();

export default proposalActionUtils;
