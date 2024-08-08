import { type IProposal } from '@/modules/governance/api/governanceService';
import { ProposalActionType } from '@/modules/governance/api/governanceService/domain/enum/proposalActionType';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { deepMerge } from '@/shared/utils/helpers/deepMerge';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils/pluginRegistryUtils';
import {
    type IProposalAction,
    type IProposalActionChangeMembers,
    type IProposalActionChangeSettings,
    type IProposalActionWithdrawToken,
    proposalActionsUtils as ODSProposalActionUtils,
    ProposalActionType as ProposalActionTypeODS,
} from '@aragon/ods';
import { formatUnits } from 'viem';

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

    normalizeActions = (plugins: string[], fetchedActions: IProposalAction[], proposal: IProposal, daoId: string): IProposalAction[] => {
        return fetchedActions.map((action) => {
            const mappedType = this.actionTypeMapping[action.type as ProposalActionType];
            const normalizedAction = { ...action, type: mappedType };

            console.log('normalizedAction', normalizedAction);

            if (ODSProposalActionUtils.isWithdrawTokenAction(normalizedAction)) {
                return this.normalizeTransferAction(normalizedAction);
            }
            if (ODSProposalActionUtils.isChangeSettingsAction(normalizedAction)) {
                return this.normalizeChangeSettingsAction(normalizedAction, plugins, proposal, daoId);
            }
            if (ODSProposalActionUtils.isChangeMembersAction(normalizedAction)) {
                return this.normalizeChangeMembersAction(normalizedAction);
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
        const parsedProposedSettings = parsingFunction && parsingFunction({ settings: completedSettingsObjectProposed, daoId });
    
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
}

const proposalActionUtils = new ProposalActionUtils();

export default proposalActionUtils;
