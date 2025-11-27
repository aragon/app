'use client';

import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { type IDaoPlugin, useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { addressUtils, ChainEntityType, DefinitionList, formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import { useMemberList } from '../../../../modules/governance/api/governanceService';
import { daoUtils } from '../../../../shared/utils/daoUtils';

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

    const distribution = memberList?.pages[0]?.metadata.totalRecords ?? '';

    const { buildEntityUrl } = useDaoChain({ network: plugin.settings.token.network });

    const { token } = plugin.settings;
    const parsedTotalSupply = token.totalSupply && formatUnits(BigInt(token.totalSupply), token.decimals);

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
                }}
                copyValue={token.address}
                description={t('app.plugins.token.tokenMemberInfo.tokenNameAndSymbol', {
                    tokenName: token.name,
                    tokenSymbol: token.symbol,
                })}
            >
                {addressUtils.truncateAddress(token.address)}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t('app.plugins.token.tokenMemberInfo.distribution')}
                link={{
                    href: daoUtils.getDaoUrl(dao, 'members'),
                    isExternal: false,
                }}
            >
                {t('app.plugins.token.tokenMemberInfo.tokenDistribution', { count: distribution })}
            </DefinitionList.Item>
            {formattedTotalSupply && Number(formattedTotalSupply) > 0 && (
                <DefinitionList.Item term={t('app.plugins.token.tokenMemberInfo.supply')}>
                    <p className="text-neutral-500">
                        {t('app.plugins.token.tokenMemberInfo.tokenSupply', {
                            supply: formattedTotalSupply,
                            symbol: token.symbol,
                        })}
                    </p>
                </DefinitionList.Item>
            )}
        </DefinitionList.Container>
    );
};
