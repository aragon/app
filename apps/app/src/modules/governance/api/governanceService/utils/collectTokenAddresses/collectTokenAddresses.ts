import type { Hex } from 'viem';
import { lockToVoteProposalUtils } from '@/plugins/lockToVotePlugin/utils/lockToVoteProposalUtils';
import { sppProposalUtils } from '@/plugins/sppPlugin/utils/sppProposalUtils';
import type { IProposal } from '../../domain';

/**
 * Walks a proposal (and, when present, its SPP stages and sub-proposals) and returns the unique
 * lowercased token addresses for plugins/bodies whose status math requires a live `totalSupply`
 * read. Today only lock-to-vote bodies qualify.
 */
export const collectTokenAddresses = (proposal: IProposal): Hex[] => {
    const collected = new Set<string>();

    const addAddress = (address: string | undefined) => {
        if (address != null && address.length > 0) {
            collected.add(address.toLowerCase());
        }
    };

    if (lockToVoteProposalUtils.isLockToVoteProposal(proposal)) {
        addAddress(proposal.settings.token.address);
    }

    if (sppProposalUtils.isSppProposal(proposal)) {
        proposal.settings.stages.forEach((stage) => {
            stage.plugins.forEach((plugin) => {
                if (lockToVoteProposalUtils.isLockToVoteStagePlugin(plugin)) {
                    addAddress(plugin.settings.token.address);
                }
            });
        });
    }

    return Array.from(collected) as Hex[];
};
