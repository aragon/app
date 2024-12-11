import { type IMember, useMember } from '@/modules/governance/api/governanceService';
import { type IUseConnectedParticipantGuardBaseParams } from '@/modules/governance/hooks/useConnectedParticpantGuard';
import type { IPermissionCheckGuardResult } from '@/modules/governance/types';
import { type ITokenMember } from '@/plugins/tokenPlugin/types';
import { useAccount } from 'wagmi';

export interface ITokenProposalCreationRequirementsParams extends IUseConnectedParticipantGuardBaseParams {}

const isTokenMember = (member?: IMember): member is ITokenMember =>
    member != null &&
    (('tokenBalance' in member && member.tokenBalance != null) ||
        ('votingPower' in member && member.votingPower != null));

export const useTokenCreateProposalRequirements = (
    params: ITokenProposalCreationRequirementsParams,
): IPermissionCheckGuardResult => {
    const { plugin, daoId } = params;

    const { address } = useAccount();

    const pluginMinProposerVotingPower = plugin.meta.settings.minProposerVotingPower;
    const pluginTokenSymbol = plugin.meta.settings.token.symbol;

    const minTokenRequired = `${pluginMinProposerVotingPower} ${pluginTokenSymbol}`;

    const memberUrlParams = { address: address as string };
    const memberQueryParams = { daoId, pluginAddress: plugin.meta.address };
    const { data: member, isLoading } = useMember({ urlParams: memberUrlParams, queryParams: memberQueryParams });

    const pluginName = plugin.meta.name ?? 'Multisig TODO'; // TODO

    if (!isTokenMember(member)) {
        return {
            hasPermission: false,
            settings: [
                {
                    term: 'Name',
                    definition: pluginName,
                },
                {
                    term: 'Proposal creation',
                    definition: minTokenRequired, // TODO
                },
                {
                    term: 'Your token balance',
                    definition: `0 ${pluginTokenSymbol}`,
                },
                {
                    term: 'Your voting power',
                    definition: `0 ${pluginTokenSymbol}`,
                },
            ],
            isLoading: isLoading,
        };
    }

    if (member.votingPower && BigInt(member.votingPower) >= BigInt(pluginMinProposerVotingPower as string)) {
        return {
            hasPermission: true,
            settings: [],
            isLoading: isLoading,
        };
    }

    const insufficientVotingPower = member.votingPower ?? '0';
    const insufficientTokenBalance = member.tokenBalance ?? '0';

    return {
        hasPermission: false,
        settings: [
            {
                term: 'Name',
                definition: 'Group name',
            },
            {
                term: 'Proposal creation',
                definition: pluginName,
            },
            {
                term: 'Your voting power',
                definition: `${insufficientVotingPower} ${pluginTokenSymbol}`,
            },
            {
                term: 'Your token balance',
                definition: `${insufficientTokenBalance} ${pluginTokenSymbol}`,
            },
        ],
        isLoading: isLoading,
    };
};
