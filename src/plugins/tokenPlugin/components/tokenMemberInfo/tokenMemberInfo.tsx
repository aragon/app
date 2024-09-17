'use client';
import type { IDaoTokenSettings } from '@/plugins/tokenPlugin/types';
import { useDaoSettings } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
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
import { formatUnits } from 'viem';
import { useMemberList } from '../../../../modules/governance/api/governanceService';

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

    const chainId = daoSettings ? networkDefinitions[daoSettings.token.network].chainId : undefined;
    const { buildEntityUrl } = useBlockExplorer({ chainId });

    if (daoSettings == null) {
        return null;
    }

    const parsedTotalSupply =
        daoSettings.token.totalSupply != null
            ? formatUnits(BigInt(daoSettings.token.totalSupply), daoSettings?.token.decimals)
            : '0';
    const formattedTotalSupply = formatterUtils.formatNumber(parsedTotalSupply, {
        format: NumberFormat.TOKEN_AMOUNT_LONG,
    });

    return (
        <DefinitionList.Container>
            <DefinitionList.Item term={t('app.plugins.token.tokenMemberInfo.eligibleVoters')}>
                <p className="text-neutral-500">{t('app.plugins.token.tokenMemberInfo.tokenHolders')}</p>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenMemberInfo.tokenLabel')}>
                <Link
                    description={t('app.plugins.token.tokenMemberInfo.tokenLinkDescription')}
                    iconRight={IconType.LINK_EXTERNAL}
                    href={buildEntityUrl({ type: ChainEntityType.TOKEN, id: daoSettings.token.address })}
                    target="_blank"
                >
                    {t('app.plugins.token.tokenMemberInfo.tokenNameAndSymbol', {
                        tokenName: daoSettings.token.name,
                        tokenSymbol: daoSettings.token.symbol,
                    })}
                </Link>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenMemberInfo.distribution')}>
                <Link
                    description={addressUtils.truncateAddress(daoSettings.token.address)}
                    iconRight={IconType.LINK_EXTERNAL}
                    href={`/dao/${daoId}/members`}
                >
                    {t('app.plugins.token.tokenMemberInfo.tokenDistribution', { count: distribution })}
                </Link>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenMemberInfo.supply')}>
                <p className="text-neutral-500">
                    {t('app.plugins.token.tokenMemberInfo.tokenSupply', {
                        supply: formattedTotalSupply,
                        symbol: daoSettings.token.symbol,
                    })}
                </p>
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
