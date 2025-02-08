import type { ITokenVotingMember } from '@/modules/createDao/components/createProcessForm';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DefinitionList, formatterUtils, NumberFormat, Tag } from '@aragon/gov-ui-kit';

export interface ITokenProcessBodyField {
    /**
     * The name of the token.
     */
    tokenName: string;
    /**
     * The symbol of the token.
     */
    tokenSymbol: string;
    /**
     * The members of the body holding the token.
     */
    members: ITokenVotingMember[];
    /**
     * The support threshold of the body.
     */
    supportThreshold: number;
    /**
     * The minimum participation of the body.
     */
    minimumParticipation: number;
    /**
     * Defines if vote change is enabled on the body.
     */
    voteChange: boolean;
}

export interface ITokenProcessBodyFieldProps {
    /**
     * The field to display.
     */
    field: ITokenProcessBodyField;
}

export const TokenProcessBodyField = (props: ITokenProcessBodyFieldProps) => {
    const { field } = props;

    const { members, tokenName, tokenSymbol, supportThreshold, minimumParticipation, voteChange } = field;

    const { t } = useTranslations();

    return (
        <DefinitionList.Container className="w-full">
            <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.token')}>
                {tokenName} (${tokenSymbol})
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.distribution')}>
                {members.length}
                {members.length > 1
                    ? t('app.plugins.token.tokenProcessBodyField.plural')
                    : t('app.plugins.token.tokenProcessBodyField.single')}
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.supply')}>
                {formatterUtils.formatNumber(
                    members.reduce((sum, member) => sum + Number(member.tokenAmount), 0),
                    { format: NumberFormat.TOKEN_AMOUNT_LONG },
                )}{' '}
                ${tokenSymbol}
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.support')}>
                {`> ${supportThreshold.toString()}%`}
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.minimum')}>
                {`≥ ${minimumParticipation.toString()}%`}
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenProcessBodyField.voteChange')}>
                <Tag
                    label={
                        voteChange
                            ? t('app.plugins.token.tokenProcessBodyField.yes')
                            : t('app.plugins.token.tokenProcessBodyField.no')
                    }
                    variant={voteChange ? 'primary' : 'neutral'}
                    className="max-w-fit"
                />
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
