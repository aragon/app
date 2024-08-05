import { transformMultisigGovernanceSettings } from '@/modules/governance/utils/transformMultisigGovernanceSettings';
import { transformTokenGovernanceSettings } from '@/modules/governance/utils/transformTokenGovernanceSettings';
import {
    type IProposalAction,
    type IProposalActionChangeSettings,
    type IProposalActionWithdrawToken,
    proposalActionsUtils as ODSProposalActionUtils,
    ProposalActionType,
} from '@aragon/ods';
import { formatUnits } from 'viem';

enum ProposalActionTypeBackend {
    Transfer = 'Transfer',
    Mint = 'Mint',
    MultisigAddMembers = 'MultisigAddMembers',
    MultisigRemoveMembers = 'MultisigRemoveMembers',
    MetadataUpdate = 'MetadataUpdate',
    UpdateMultiSigSettings = 'UpdateMultiSigSettings',
    UpdateVoteSettings = 'UpdateVoteSettings',
}

class ProposalActionUtils {
    actionTypeMapping: { [key in ProposalActionTypeBackend]: ProposalActionType } = {
        [ProposalActionTypeBackend.Transfer]: ProposalActionType.WITHDRAW_TOKEN,
        [ProposalActionTypeBackend.Mint]: ProposalActionType.TOKEN_MINT,
        [ProposalActionTypeBackend.MultisigAddMembers]: ProposalActionType.ADD_MEMBERS,
        [ProposalActionTypeBackend.MultisigRemoveMembers]: ProposalActionType.REMOVE_MEMBERS,
        [ProposalActionTypeBackend.MetadataUpdate]: ProposalActionType.UPDATE_METADATA,
        [ProposalActionTypeBackend.UpdateMultiSigSettings]: ProposalActionType.CHANGE_SETTINGS_MULTISIG,
        [ProposalActionTypeBackend.UpdateVoteSettings]: ProposalActionType.CHANGE_SETTINGS_TOKENVOTE,
    };

    normalizeActions = (plugins: string[], fetchedActions: IProposalAction[]): IProposalAction[] => {
        return fetchedActions.map((action) => {
            const mappedType = this.actionTypeMapping[action.type as ProposalActionTypeBackend];
            const normalizedAction = { ...action, type: mappedType };

            if (ODSProposalActionUtils.isWithdrawTokenAction(normalizedAction)) {
                return this.normalizeTransferAction(normalizedAction);
            }
            if (ODSProposalActionUtils.isChangeSettingsAction(normalizedAction)) {
                return this.normalizeChangeSettingsAction(plugins, normalizedAction);
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
        plugins: string[],
        action: IProposalActionChangeSettings,
    ): IProposalActionChangeSettings => {
        const { proposedSettings, existingSettings, ...otherValues } = action;

        if (plugins.includes('multisig')) {
            return {
                ...otherValues,
                proposedSettings: transformMultisigGovernanceSettings(proposedSettings),
                existingSettings: transformMultisigGovernanceSettings(existingSettings),
            };
        }
        if (plugins.includes('token-voting')) {
            return {
                ...otherValues,
                proposedSettings: transformTokenGovernanceSettings(proposedSettings),
                existingSettings: transformTokenGovernanceSettings(existingSettings),
            };
        }
        return action;
    };
}

const proposalActionUtils = new ProposalActionUtils();

export default proposalActionUtils;
