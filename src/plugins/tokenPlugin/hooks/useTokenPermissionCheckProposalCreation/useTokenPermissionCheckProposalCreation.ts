import { useMember } from '@/modules/governance/api/governanceService';
import type { IUseCheckPermissionGuardBaseParams } from '@/modules/governance/hooks/usePermissionCheckGuard/usePermissionCheckGuard';
import type { IPermissionCheckGuardResult } from '@/modules/governance/types';
import type { ITokenMember, ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { formatterUtils, numberFormats } from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';

export interface ITokenPermissionCheckProposalCreationParams extends IUseCheckPermissionGuardBaseParams {
    /**
     * Plugin to create the proposal for.
     */
    plugin: IDaoPlugin<ITokenPluginSettings>;
}

export const useTokenPermissionCheckProposalCreation = (
    params: ITokenPermissionCheckProposalCreationParams,
): IPermissionCheckGuardResult => {
    const { plugin, daoId } = params;

    const { address } = useAccount();

    const { t } = useTranslations();

    const tokenDecimals = plugin.settings.token.decimals;

    const minVotingPower = plugin.settings.minProposerVotingPower;
    const parsedMinVotingPower = formatUnits(BigInt(minVotingPower), tokenDecimals);
    const formattedMinVotingPower = formatterUtils.formatNumber(parsedMinVotingPower, numberFormats.TOKEN_AMOUNT_SHORT);

    const tokenSymbol = plugin.settings.token.symbol;

    const minTokenRequired = `${formattedMinVotingPower ?? '0'} ${tokenSymbol}`;

    const memberUrlParams = { address: address as string };
    const memberQueryParams = { daoId, pluginAddress: plugin.address };
    const { data: member, isLoading } = useMember<ITokenMember>({
        urlParams: memberUrlParams,
        queryParams: memberQueryParams,
    });

    const pluginName = daoUtils.getPluginName(plugin);

    const hasPermission = member?.votingPower && BigInt(member.votingPower) >= BigInt(minVotingPower);

    if (hasPermission) {
        return {
            hasPermission: true,
            settings: [],
            isLoading,
        };
    }

    const parsedInsufficientMin = formatUnits(BigInt(member?.votingPower ?? '0'), tokenDecimals);
    const formattedInsufficientMin = formatterUtils.formatNumber(
        parsedInsufficientMin,
        numberFormats.TOKEN_AMOUNT_SHORT,
    );

    const parsedInsufficientBalance = formatUnits(BigInt(member?.tokenBalance ?? '0'), tokenDecimals);
    const formattedInsufficientBalance = formatterUtils.formatNumber(
        parsedInsufficientBalance,
        numberFormats.TOKEN_AMOUNT_SHORT,
    );

    return {
        hasPermission: false,
        settings: [
            {
                term: t('app.plugins.token.tokenProposalCreationRequirements.name'),
                definition: pluginName,
            },
            {
                term: t('app.plugins.token.tokenProposalCreationRequirements.proposalCreation'),
                definition: minTokenRequired,
            },
            {
                term: t('app.plugins.token.tokenProposalCreationRequirements.userVotingPower'),
                definition: `${formattedInsufficientMin ?? '0'} ${tokenSymbol}`,
            },
            {
                term: t('app.plugins.token.tokenProposalCreationRequirements.userTokenBalance'),
                definition: `${formattedInsufficientBalance ?? '0'} ${tokenSymbol}`,
            },
        ],
        isLoading,
    };
};
