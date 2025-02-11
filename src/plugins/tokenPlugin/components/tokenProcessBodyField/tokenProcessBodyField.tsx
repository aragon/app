import type { ITokenVotingMember } from '@/modules/createDao/components/createProcessForm';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DefinitionList, formatterUtils, NumberFormat, Tag } from '@aragon/gov-ui-kit';

export interface ITokenProcessBody {
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
     * The field from the create process form.
     */
    field: ITokenProcessBody;
}

export const TokenProcessBodyField = (props: ITokenProcessBodyFieldProps) => {
    const { t } = useTranslations();

    const { field } = props;
    const { members, tokenName, tokenSymbol, supportThreshold, minimumParticipation, voteChange } = field;

    const supply = members.reduce((sum, member) => sum + Number(member.tokenAmount), 0);
    const formattedSupply = formatterUtils.formatNumber(supply, {
        format: NumberFormat.TOKEN_AMOUNT_LONG,
        fallback: '0',
    });

    const baseTranslationKey = 'app.plugins.token.tokenProcessBodyField';
    const voteChangeLabel = voteChange ? t(`${baseTranslationKey}.yes`) : t(`${baseTranslationKey}.no`);
    const membersDefinition =
        members.length > 1 ? t(`${baseTranslationKey}.plural`) : t(`${baseTranslationKey}.single`);

    return (
        <DefinitionList.Container className="w-full">
            <DefinitionList.Item term={t(`${baseTranslationKey}.token`)}>
                {tokenName} (${tokenSymbol})
            </DefinitionList.Item>
            <DefinitionList.Item term={t(`${baseTranslationKey}.distribution`)}>
                {`${members.length.toString()} ${membersDefinition}`}
            </DefinitionList.Item>
            <DefinitionList.Item term={t(`${baseTranslationKey}.supply`)}>
                {`${formattedSupply!} ${tokenSymbol}`}
            </DefinitionList.Item>
            <DefinitionList.Item term={t(`${baseTranslationKey}.support`)}>
                {`> ${supportThreshold.toString()}%`}
            </DefinitionList.Item>
            <DefinitionList.Item term={t(`${baseTranslationKey}.minimum`)}>
                {`≥ ${minimumParticipation.toString()}%`}
            </DefinitionList.Item>
            <DefinitionList.Item term={t(`${baseTranslationKey}.voteChange`)}>
                <Tag label={voteChangeLabel} variant={voteChange ? 'primary' : 'neutral'} className="max-w-fit" />
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
