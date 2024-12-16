import { useMember } from '@/modules/governance/api/governanceService';
import type { IPermissionCheckGuardResult, IUsePermissionCheckGuardSlotParams } from '@/modules/governance/types';
import type { ITokenMember, ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { formatterUtils, numberFormats } from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';

export interface ITokenPermissionCheckProposalCreationParams
    extends IUsePermissionCheckGuardSlotParams<ITokenPluginSettings> {}

export const useTokenPermissionCheckProposalCreation = (
    params: ITokenPermissionCheckProposalCreationParams,
): IPermissionCheckGuardResult => {
    const { plugin, daoId } = params;

    const { address } = useAccount();

    const { t } = useTranslations();

    const { decimals: tokenDecimals, symbol: tokenSymbol } = plugin.settings.token;

    const { minProposerVotingPower } = plugin.settings;
    const parsedMinVotingPower = formatUnits(BigInt(minProposerVotingPower), tokenDecimals);
    const formattedMinVotingPower = formatterUtils.formatNumber(parsedMinVotingPower, numberFormats.TOKEN_AMOUNT_SHORT);

    const minTokenRequired = `${formattedMinVotingPower ?? '0'} ${tokenSymbol}`;

    const memberUrlParams = { address: address as string };
    const memberQueryParams = { daoId, pluginAddress: plugin.address };
    const { data: member, isLoading } = useMember<ITokenMember>({
        urlParams: memberUrlParams,
        queryParams: memberQueryParams,
    });

    const pluginName = daoUtils.getPluginName(plugin);

    const hasPermission = member?.votingPower && BigInt(member.votingPower) >= BigInt(minProposerVotingPower);

    const parsedMemberVotingPower = formatUnits(BigInt(member?.votingPower ?? '0'), tokenDecimals);
    const formattedMemberVotingPower = formatterUtils.formatNumber(
        parsedMemberVotingPower,
        numberFormats.TOKEN_AMOUNT_SHORT,
    );

    const parsedMemberBalance = formatUnits(BigInt(member?.tokenBalance ?? '0'), tokenDecimals);
    const formattedMemberBalance = formatterUtils.formatNumber(parsedMemberBalance, numberFormats.TOKEN_AMOUNT_SHORT);

    if (hasPermission) {
        return {
            hasPermission: true,
            settings: [],
            isLoading,
        };
    }

    return {
        hasPermission: false,
        settings: [
            {
                term: t('app.plugins.token.tokenPermissionCheckProposalCreation.name'),
                definition: pluginName,
            },
            {
                term: t('app.plugins.token.tokenPermissionCheckProposalCreation.proposalCreation'),
                definition: minTokenRequired,
            },
            {
                term: t('app.plugins.token.tokenPermissionCheckProposalCreation.userVotingPower'),
                definition: `${formattedMemberVotingPower ?? '0'} ${tokenSymbol}`,
            },
            {
                term: t('app.plugins.token.tokenPermissionCheckProposalCreation.userTokenBalance'),
                definition: `${formattedMemberBalance ?? '0'} ${tokenSymbol}`,
            },
        ],
        isLoading,
    };
};
