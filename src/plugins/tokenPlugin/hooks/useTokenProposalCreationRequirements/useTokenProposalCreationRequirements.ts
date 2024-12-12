import { useMember, type IMember } from '@/modules/governance/api/governanceService';
import { type IUseConnectedParticipantGuardBaseParams } from '@/modules/governance/hooks/useConnectedParticipantGuard';
import type { IPermissionCheckGuardResult } from '@/modules/governance/types';
import { type ITokenMember, type ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { type IDaoPlugin } from '@/shared/api/daoService';
import { type ITabComponentPlugin } from '@/shared/components/pluginTabComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { formatterUtils, numberFormats } from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';

export interface ITokenProposalCreationRequirementsParams extends IUseConnectedParticipantGuardBaseParams {
    /**
     * Plugin to create the proposal for.
     */
    plugin: ITabComponentPlugin<IDaoPlugin<ITokenPluginSettings>>;
}

const isTokenMember = (member?: IMember): member is ITokenMember =>
    member != null &&
    (('tokenBalance' in member && member.tokenBalance != null) ||
        ('votingPower' in member && member.votingPower != null));

export const useTokenCreateProposalRequirements = (
    params: ITokenProposalCreationRequirementsParams,
): IPermissionCheckGuardResult => {
    const { plugin, daoId } = params;

    const { address } = useAccount();

    const { t } = useTranslations();

    const tokenDecimals = plugin.meta.settings.token.decimals;

    const minVotingPower = plugin.meta.settings.minProposerVotingPower;
    const parsedMinVotingPower = formatUnits(BigInt(minVotingPower), tokenDecimals);
    const formattedMinVotingPower = formatterUtils.formatNumber(parsedMinVotingPower, numberFormats.TOKEN_AMOUNT_SHORT);

    const tokenSymbol = plugin.meta.settings.token.symbol;

    const minTokenRequired = `${formattedMinVotingPower ?? '0'} ${tokenSymbol}`;

    const memberUrlParams = { address: address as string };
    const memberQueryParams = { daoId, pluginAddress: plugin.meta.address };
    const { data: member, isLoading } = useMember({ urlParams: memberUrlParams, queryParams: memberQueryParams });

    const pluginName = daoUtils.getPluginName(plugin.meta);

    if (!isTokenMember(member)) {
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
                    definition: `0 ${tokenSymbol}`,
                },
                {
                    term: t('app.plugins.token.tokenProposalCreationRequirements.userTokenBalance'),
                    definition: `0 ${tokenSymbol}`,
                },
            ],
            isLoading,
        };
    }

    const hasPermission = member.votingPower && BigInt(member.votingPower) >= BigInt(minVotingPower);

    if (hasPermission) {
        return {
            hasPermission: true,
            settings: [],
            isLoading,
        };
    }

    const insufficientMin = member.votingPower ?? '0';
    const parsedInsuficcientMin = formatUnits(BigInt(insufficientMin), tokenDecimals);
    const formattedInsufficientMin = formatterUtils.formatNumber(
        parsedInsuficcientMin,
        numberFormats.TOKEN_AMOUNT_SHORT,
    );
    const insufficientBalance = member.tokenBalance ?? '0';
    const parsedInsufficientBalance = formatUnits(BigInt(insufficientBalance), tokenDecimals);
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
