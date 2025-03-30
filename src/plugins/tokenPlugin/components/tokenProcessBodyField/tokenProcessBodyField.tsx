import type { ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DefinitionList, formatterUtils, NumberFormat, Tag } from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import { DaoTokenVotingMode } from '../../types';
import type { ITokenSetupGovernanceForm } from '../tokenSetupGovernance';
import type { ITokenSetupMembershipForm, ITokenSetupMembershipMember } from '../tokenSetupMembership';

export interface ITokenProcessBodyFieldProps {
    /**
     * The field from the create process form.
     */
    body: ISetupBodyForm<ITokenSetupGovernanceForm, ITokenSetupMembershipMember, ITokenSetupMembershipForm>;
}

export const TokenProcessBodyField = (props: ITokenProcessBodyFieldProps) => {
    const { body } = props;

    const { t } = useTranslations();

    const { membership, governance } = body;
    const { name: tokenName, symbol: tokenSymbol, decimals: tokenDecimals, totalSupply } = membership.token;
    const { votingMode, supportThreshold, minParticipation } = governance;

    const parsedTotalSupply = formatUnits(BigInt(totalSupply), tokenDecimals);
    const formattedSupply = formatterUtils.formatNumber(parsedTotalSupply, {
        format: NumberFormat.TOKEN_AMOUNT_LONG,
        fallback: '0',
    });

    const voteChange = votingMode === DaoTokenVotingMode.VOTE_REPLACEMENT;
    const voteChangeLabel = voteChange ? 'enabled' : 'disabled';

    return (
        <DefinitionList.Container className="w-full">
            <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.tokenTerm')}>
                {tokenName} (${tokenSymbol})
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.distributionTerm')}>
                {t('app.plugins.token.tokenProcessBodyField.holders', { count: membership.members.length })}
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.supplyTerm')}>
                {`${formattedSupply!} ${tokenSymbol}`}
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.supportTerm')}>
                {t('app.plugins.token.tokenProcessBodyField.supportDefinition', { threshold: supportThreshold })}
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.minParticipationTerm')}>
                {t('app.plugins.token.tokenProcessBodyField.minParticipationDefinition', { minParticipation })}
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.voteChange')}>
                <Tag
                    label={t(`app.plugins.token.tokenProcessBodyField.${voteChangeLabel}`)}
                    variant={voteChange ? 'primary' : 'neutral'}
                    className="max-w-fit"
                />
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
