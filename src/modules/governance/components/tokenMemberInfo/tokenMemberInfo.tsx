'use client';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DefinitionList, IconType, Link } from '@aragon/ods';

export interface ITokenMemberInfoProps {
    /**
     * Eligible voters (Multisig members | Token holders).
     */
    eligibleVoters: string;
    /**
     * Token information.
     */
    token: {
        name: string;
        symbol: string;
        address: string;
        link: string;
    };
    /**
     * Number of token holders.
     */
    distribution: number;
    /**
     * Total supply.
     */
    supply: number;
}

export const TokenMemberInfo: React.FC<ITokenMemberInfoProps> = (props) => {
    const { eligibleVoters, token, distribution, supply } = props;
    const { t } = useTranslations();

    const eligibleVotersType =
        eligibleVoters === 'Token Holders'
            ? t('app.plugins.token.tokenMemberInfo.tokenHolders')
            : t('app.plugins.token.tokenMemberInfo.multisigMembers');
    return (
        <DefinitionList.Container>
            <DefinitionList.Item term={t('app.plugins.token.tokenMemberInfo.eligibleVoters')}>
                <p>{eligibleVotersType}</p>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenMemberInfo.token')}>
                <Link
                    description={t('app.plugins.token.tokenMemberInfo.tokenLinkDescription')}
                    iconRight={IconType.LINK_EXTERNAL}
                    href={'./members'}
                >
                    {t('app.plugins.token.tokenMemberInfo.tokenNameAndSymbol', {
                        tokenName: token.name,
                        tokenSymbol: token.symbol,
                    })}
                </Link>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenMemberInfo.distribution')}>
                <Link description={token.address} iconRight={IconType.LINK_EXTERNAL} href={token.link} target="_blank">
                    {t('app.plugins.token.tokenMemberInfo.tokenDistribution', { count: distribution })}
                </Link>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenMemberInfo.supply')}>
                <p>{t('app.plugins.token.tokenMemberInfo.tokenSupply', { supply: supply, symbol: token.symbol })}</p>
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
