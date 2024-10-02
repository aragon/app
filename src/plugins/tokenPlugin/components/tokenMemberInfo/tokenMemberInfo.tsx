'use client';

import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { IDaoPlugin } from '@/shared/api/daoService';
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
    /**
     * DAO plugin to display the members info for.
     */
    plugin: IDaoPlugin<ITokenPluginSettings>;
}

export const TokenMemberInfo: React.FC<ITokenMemberInfoProps> = (props) => {
    const { daoId, plugin } = props;

    const { t } = useTranslations();

    const daoMemberParams = { daoId, pluginAddress: plugin.address };
    const { data: memberList } = useMemberList({ queryParams: daoMemberParams });

    const distribution = memberList?.pages[0].metadata.totalRecords;

    const chainId = networkDefinitions[plugin.settings.token.network].chainId;
    const { buildEntityUrl } = useBlockExplorer({ chainId });

    const { token } = plugin.settings;
    const parsedTotalSupply = formatUnits(BigInt(token.totalSupply), token.decimals);

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
                    href={buildEntityUrl({ type: ChainEntityType.TOKEN, id: token.address })}
                    target="_blank"
                >
                    {t('app.plugins.token.tokenMemberInfo.tokenNameAndSymbol', {
                        tokenName: token.name,
                        tokenSymbol: token.symbol,
                    })}
                </Link>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.token.tokenMemberInfo.distribution')}>
                <Link
                    description={addressUtils.truncateAddress(token.address)}
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
                        symbol: token.symbol,
                    })}
                </p>
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
