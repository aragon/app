import type { ISetupBodyFormNew } from '@/modules/createDao/dialogs/setupBodyDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { dateUtils } from '@/shared/utils/dateUtils';
import { DefinitionList, formatterUtils, NumberFormat, Tag } from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import { DaoTokenVotingMode } from '../../types';
import type { ITokenSetupGovernanceForm } from '../tokenSetupGovernance';
import type { ITokenSetupMembershipForm, ITokenSetupMembershipMember } from '../tokenSetupMembership';

export interface ITokenProcessBodyFieldProps {
    /**
     * The field from the create process form.
     */
    body: ISetupBodyFormNew<ITokenSetupGovernanceForm, ITokenSetupMembershipMember, ITokenSetupMembershipForm>;
    /**
     * Displays / hides some of the token-voting governance settings depending on the process governance type.
     */
    isAdvancedGovernance?: boolean;
}

export const TokenProcessBodyField = (props: ITokenProcessBodyFieldProps) => {
    const { body, isAdvancedGovernance } = props;

    const { t } = useTranslations();

    const { membership, governance } = body;
    const { name: tokenName, symbol: tokenSymbol, decimals: tokenDecimals, totalSupply } = membership.token;
    const { votingMode, supportThreshold, minParticipation, minDuration } = governance;

    const parsedTotalSupply = formatUnits(BigInt(totalSupply), tokenDecimals);
    const formattedSupply = formatterUtils.formatNumber(parsedTotalSupply, {
        format: NumberFormat.TOKEN_AMOUNT_LONG,
        fallback: '0',
    });

    const voteChangeLabel = votingMode === DaoTokenVotingMode.VOTE_REPLACEMENT ? 'enabled' : 'disabled';
    const earlyExecutionLabel = votingMode === DaoTokenVotingMode.EARLY_EXECUTION ? 'enabled' : 'disabled';

    const minDurationObject = dateUtils.secondsToDuration(minDuration);
    const formattedMinDuration = t('app.plugins.token.tokenProcessBodyField.minDurationDefinition', minDurationObject);

    const numberOfMembers = membership.members.length;

    return (
        <DefinitionList.Container className="w-full">
            <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.tokenTerm')}>
                {tokenName} (${tokenSymbol})
            </DefinitionList.Item>
            {numberOfMembers > 0 && (
                <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.distributionTerm')}>
                    {t('app.plugins.token.tokenProcessBodyField.holders', { count: numberOfMembers })}
                </DefinitionList.Item>
            )}
            <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.supplyTerm')}>
                {`${formattedSupply!} ${tokenSymbol}`}
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
