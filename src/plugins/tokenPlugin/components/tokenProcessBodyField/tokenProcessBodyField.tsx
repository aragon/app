'use client';

import type { ISetupBodyFormNew } from '@/modules/createDao/dialogs/setupBodyDialog';
import { useMemberListData } from '@/modules/governance/hooks/useMemberListData';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { dateUtils } from '@/shared/utils/dateUtils';
import { DefinitionList, formatterUtils, NumberFormat, Tag } from '@aragon/gov-ui-kit';
import { formatUnits, type Hash } from 'viem';
import { DaoTokenVotingMode, type ITokenPluginSettings } from '../../types';
import type { ITokenSetupGovernanceForm } from '../tokenSetupGovernance';
import type { ITokenSetupMembershipForm, ITokenSetupMembershipMember } from '../tokenSetupMembership';
import { useToken } from '../tokenSetupMembership/hooks/useToken';

export interface ITokenProcessBodyFieldProps {
    /**
     * The field from the create process form.
     */
    body: ISetupBodyFormNew<ITokenSetupGovernanceForm, ITokenSetupMembershipMember, ITokenSetupMembershipForm>;
    /**
     * Displays / hides some of the token-voting governance settings depending on the process governance type.
     */
    isAdvancedGovernance?: boolean;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Address of the plugin.
     */
    pluginAddress: string;
    /**
     * Indicates whether the field is read-only.
     */
    readOnly?: boolean;
}

export const TokenProcessBodyField = (props: ITokenProcessBodyFieldProps) => {
    const { body, isAdvancedGovernance, daoId, pluginAddress, readOnly } = props;

    const { t } = useTranslations();

    const { membership, governance } = body;

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const chainId = networkDefinitions[dao!.network].id;

    const plugin = useDaoPlugins({ daoId, pluginAddress, type: PluginType.BODY, includeSubPlugins: true })![0];

    console.log('plugin', plugin);

    const tokenAddress = (plugin.meta.settings as ITokenPluginSettings).token.address;

    const { data: tokenReadOnly, isLoading } = useToken({
        address: tokenAddress as Hash,
        chainId,
        enabled: true,
    });

    const initialParams = { queryParams: { daoId, pluginAddress } };
    const { itemsCount } = useMemberListData(initialParams);

    const resolveToken = () => {
        if (readOnly) {
            return {
                name: tokenReadOnly?.name ?? '-',
                symbol: tokenReadOnly?.symbol ?? '-',
                decimals: tokenReadOnly?.decimals ?? 0,
                totalSupply: tokenReadOnly?.totalSupply ?? '0',
            };
        }
        return {
            name: membership.token.name,
            symbol: membership.token.symbol,
            decimals: membership.token.decimals,
            totalSupply: membership.token.totalSupply,
        };
    };

    const resolveGovernance = () => {
        if (readOnly) {
            return {
                votingMode: (plugin.meta.settings as ITokenPluginSettings).votingMode,
                supportThreshold: (plugin.meta.settings as ITokenPluginSettings).supportThreshold * 0.0001,
                minParticipation: (plugin.meta.settings as ITokenPluginSettings).minParticipation * 0.0001,
                minDuration: (plugin.meta.settings as ITokenPluginSettings).minDuration,
            };
        }
        return {
            votingMode: governance.votingMode,
            supportThreshold: governance.supportThreshold,
            minParticipation: governance.minParticipation,
            minDuration: governance.minDuration,
        };
    };

    const { name: tokenName, symbol: tokenSymbol, decimals: tokenDecimals, totalSupply } = resolveToken();
    const { votingMode, supportThreshold, minParticipation, minDuration } = resolveGovernance();

    const parsedTotalSupply = formatUnits(BigInt(totalSupply), tokenDecimals);
    const formattedSupply = formatterUtils.formatNumber(parsedTotalSupply, {
        format: NumberFormat.TOKEN_AMOUNT_LONG,
        fallback: '0',
    });

    const voteChangeLabel = votingMode === DaoTokenVotingMode.VOTE_REPLACEMENT ? 'enabled' : 'disabled';
    const earlyExecutionLabel = votingMode === DaoTokenVotingMode.EARLY_EXECUTION ? 'enabled' : 'disabled';

    const minDurationObject = dateUtils.secondsToDuration(minDuration);
    const formattedMinDuration = t('app.plugins.token.tokenProcessBodyField.minDurationDefinition', minDurationObject);

    const numberOfMembers = readOnly ? itemsCount : membership.members.length;

    return (
        <DefinitionList.Container className="w-full">
            <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.tokenTerm')}>
                {isLoading ? 'Fetching...' : `${tokenName} ${tokenSymbol}`}
            </DefinitionList.Item>
            {numberOfMembers! > 0 && (
                <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.distributionTerm')}>
                    {t('app.plugins.token.tokenProcessBodyField.holders', {
                        count: numberOfMembers,
                    })}
                </DefinitionList.Item>
            )}
            <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.supplyTerm')}>
                {isLoading ? 'Fetching...' : `${formattedSupply!} ${tokenSymbol}`}
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.supportTerm')}>
                {t('app.plugins.token.tokenProcessBodyField.supportDefinition', { threshold: supportThreshold })}
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.minParticipationTerm')}>
                {t('app.plugins.token.tokenProcessBodyField.minParticipationDefinition', { minParticipation })}
            </DefinitionList.Item>
            {!isAdvancedGovernance && (
                <>
                    <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.minDurationTerm')}>
                        {formattedMinDuration}
                    </DefinitionList.Item>
                    <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.earlyExecution')}>
                        <Tag
                            label={t(`app.plugins.token.tokenProcessBodyField.${earlyExecutionLabel}`)}
                            variant={earlyExecutionLabel === 'enabled' ? 'primary' : 'neutral'}
                            className="max-w-fit"
                        />
                    </DefinitionList.Item>
                </>
            )}
            <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.voteChange')}>
                <Tag
                    label={t(`app.plugins.token.tokenProcessBodyField.${voteChangeLabel}`)}
                    variant={voteChangeLabel === 'enabled' ? 'primary' : 'neutral'}
                    className="max-w-fit"
                />
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
