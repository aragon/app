'use client';

import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { type IDaoPlugin, useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    addressUtils,
    ChainEntityType,
    DefinitionList,
    formatterUtils,
    NumberFormat,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';
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

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const daoMemberParams = { daoId, pluginAddress: plugin.address };
    const { data: memberList } = useMemberList({ queryParams: daoMemberParams });

    const distribution = memberList?.pages[0]?.metadata.totalRecords;

    const { id: chainId } = networkDefinitions[plugin.settings.token.network];
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
            <DefinitionList.Item
                term={t('app.plugins.token.tokenMemberInfo.tokenLabel')}
                link={{
                    href: buildEntityUrl({ type: ChainEntityType.TOKEN, id: token.address }),
                    description: t('app.plugins.token.tokenMemberInfo.tokenLinkDescription'),
                }}
            >
                {t('app.plugins.token.tokenMemberInfo.tokenNameAndSymbol', {
                    tokenName: token.name,
                    tokenSymbol: token.symbol,
                })}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t('app.plugins.token.tokenMemberInfo.distribution')}
                link={{
                    href: dao && `/dao/${dao.network}/${dao.ens ?? dao.address}/members`,
                    description: addressUtils.truncateAddress(token.address),
                    target: '_self',
                }}
            >
                {t('app.plugins.token.tokenMemberInfo.tokenDistribution', { count: distribution })}
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
