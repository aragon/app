'use client';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    addressUtils,
    ChainEntityType,
    DefinitionList,
    formatterUtils,
    IconType,
    Link,
    NumberFormat,
    useBlockExplorer,
} from '@aragon/ods';
import { useMemberList } from '../../api/governanceService';
import { useDaoSettings } from '@/shared/api/daoService';
import type { IDaoTokenSettings } from '@/plugins/tokenPlugin/types';

export interface ITokenMemberInfoProps {
    /**
     * ID of the Dao.
     */
    daoId: string;
}

export const TokenMemberInfo: React.FC<ITokenMemberInfoProps> = (props) => {
    const { daoId } = props;
    const { t } = useTranslations();
    const daoSettingsParams = { daoId };

    const { data: memberList } = useMemberList({ queryParams: daoSettingsParams });
    const { data: daoSettings } = useDaoSettings<IDaoTokenSettings>({ urlParams: daoSettingsParams });

    const distribution = memberList?.pages[0].metadata.totalRecords;
    const eligibleVoters =
        daoSettings?.pluginSubdomain === 'token-voting'
            ? t('app.plugins.multisig.multisigMembersInfo.tokenHolders')
            : t('app.plugins.multisig.multisigMembersInfo.multisigMembers');

    const formattedTotalSupply = formatterUtils.formatNumber(daoSettings?.token.totalSupply, {
        format: NumberFormat.TOKEN_AMOUNT_LONG,
    });
    const { buildEntityUrl } = useBlockExplorer();

    return (
        <DefinitionList.Container>
            <DefinitionList.Item term={t('app.plugins.token.tokenMemberInfo.eligibleVoters')}>
                <p>{eligibleVoters}</p>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenMemberInfo.token')}>
                <Link
                    description={t('app.plugins.token.tokenMemberInfo.tokenLinkDescription')}
                    iconRight={IconType.LINK_EXTERNAL}
                    href="./members"
                >
                    {t('app.plugins.token.tokenMemberInfo.tokenNameAndSymbol', {
                        tokenName: daoSettings?.token.name,
                        tokenSymbol: daoSettings?.token.symbol,
                    })}
                </Link>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenMemberInfo.distribution')}>
                <Link
                    description={addressUtils.truncateAddress(daoSettings?.token.address)}
                    iconRight={IconType.LINK_EXTERNAL}
                    href={buildEntityUrl({ type: ChainEntityType.TOKEN, id: daoSettings?.token.address })}
                    target="_blank"
                >
                    {t('app.plugins.token.tokenMemberInfo.tokenDistribution', { count: distribution })}
                </Link>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenMemberInfo.supply')}>
                <p>
                    {t('app.plugins.token.tokenMemberInfo.tokenSupply', {
                        supply: formattedTotalSupply,
                        symbol: daoSettings?.token.symbol,
                    })}
                </p>
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
