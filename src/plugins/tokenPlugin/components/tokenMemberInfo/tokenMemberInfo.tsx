'use client';

import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { usePluginSettings } from '@/shared/hooks/usePluginSettings';
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

    const daoMemberParams = { daoId };
    const { data: memberList } = useMemberList({ queryParams: daoMemberParams });

    const pluginSettings = usePluginSettings<ITokenPluginSettings>({ daoId });

    const distribution = memberList?.pages[0].metadata.totalRecords;

    const chainId = pluginSettings ? networkDefinitions[pluginSettings.token.network].chainId : undefined;
    const { buildEntityUrl } = useBlockExplorer({ chainId });

    if (pluginSettings == null) {
        return null;
    }

    const { token } = pluginSettings;
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
