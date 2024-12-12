import {
    ProposalActionType,
    type IProposal,
    type IProposalAction,
    type IProposalActionUpdateMetadata,
    type IProposalActionUpdatePluginMetadata,
    type IProposalActionWithdrawToken,
} from '@/modules/governance/api/governanceService';
import type { IDao, IResource } from '@/shared/api/daoService';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import {
    ProposalActionType as GukProposalActionType,
    type IProposalAction as IGukProposalAction,
    type IProposalActionUpdateMetadata as IGukProposalActionUpdateMetadata,
    type IProposalActionWithdrawToken as IGukProposalActionWithdrawToken,
    type IProposalActionUpdateMetadataDaoMetadataLink,
} from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import type { INormalizeActionsParams } from '../../types';

class ProposalActionUtils {
    normalizeActions = (proposal: IProposal, dao: IDao): IGukProposalAction[] => {
        const normalizeFunction = pluginRegistryUtils.getSlotFunction<INormalizeActionsParams, IProposalAction[]>({
            slotId: GovernanceSlotId.GOVERNANCE_PLUGIN_NORMALIZE_ACTIONS,
            pluginId: proposal.pluginSubdomain,
        });

        const pluginNormalizedActions =
            normalizeFunction?.({ actions: proposal.actions, daoId: dao.id, settings: proposal.settings }) ??
            proposal.actions;

        return pluginNormalizedActions.map((action) => {
            if (this.isWithdrawTokenAction(action)) {
                return this.normalizeTransferAction(action);
            } else if (this.isUpdateMetadataAction(action)) {
                return this.normalizeUpdateMetaDataAction(action);
            }

            return action;
        });
    };

    normalizeTransferAction = (action: IProposalActionWithdrawToken): IGukProposalActionWithdrawToken => {
        const { amount, token, ...otherValues } = action;
        const parsedAmount = formatUnits(BigInt(amount), token.decimals);

        return { ...otherValues, type: GukProposalActionType.WITHDRAW_TOKEN, token, amount: parsedAmount };
    };

    normalizeUpdateMetaDataAction = (
        action: IProposalActionUpdateMetadata | IProposalActionUpdatePluginMetadata,
    ): IGukProposalActionUpdateMetadata => {
        const { type, proposedMetadata, existingMetadata, ...otherValues } = action;

        const normalizeLinks = (links: IResource[]): IProposalActionUpdateMetadataDaoMetadataLink[] =>
            links.map(({ name, url }) => ({ label: name, href: url }));

        const isPluginMetadata = type === ProposalActionType.METADATA_PLUGIN_UPDATE;

        if (isPluginMetadata) {
            const isProcess = action.existingMetadata.processKey !== undefined;

            return {
                ...otherValues,
                type: GukProposalActionType.UPDATE_PLUGIN_METADATA,
                proposedMetadata: {
                    ...proposedMetadata,
                    name: proposedMetadata.name ?? '',
                    links: normalizeLinks(proposedMetadata.links),
                    processKey: isProcess ? action.proposedMetadata.processKey : undefined,
                },
                existingMetadata: {
                    ...existingMetadata,
                    name: existingMetadata.name ?? '',
                    links: normalizeLinks(existingMetadata.links),
                    processKey: isProcess ? action.existingMetadata.processKey : undefined,
                },
            };
        }

        return {
            ...otherValues,
            type: GukProposalActionType.UPDATE_METADATA,
            proposedMetadata: {
                ...proposedMetadata,
                logo: proposedMetadata.logo ?? '',
                links: normalizeLinks(proposedMetadata.links),
            },
            existingMetadata: {
                ...existingMetadata,
                logo: existingMetadata.logo ?? '',
                links: normalizeLinks(existingMetadata.links),
            },
        };
    };

    isWithdrawTokenAction = (action: Partial<IProposalAction>): action is IProposalActionWithdrawToken => {
        return action.type === ProposalActionType.TRANSFER;
    };

    isUpdateMetadataAction = (action: Partial<IProposalAction>): action is IProposalActionUpdateMetadata => {
        return (
            action.type === ProposalActionType.METADATA_UPDATE ||
            action.type === ProposalActionType.METADATA_PLUGIN_UPDATE
        );
    };
}

export const proposalActionUtils = new ProposalActionUtils();
