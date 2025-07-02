'use client';

import { type IDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { daoUtils } from '@/shared/utils/daoUtils';
import { Link } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';
import { type IGetCampaignsListParams } from '../../api/capitalDistributorService';
import { CapitalDistributorCampaignList } from '../../components/capitalDistributorCampaignList';
import { CapitalDistributorRewardsNotConnected } from '../../components/capitalDistributorRewardsNotConnected';
import { CapitalDistributorRewardsStats } from '../../components/capitalDistributorRewardsStats';
import { capitalDistributorPlugin } from '../../constants/capitalDistributorPlugin';

export interface ICapitalDistributorRewardsPageClientProps {
    /**
     * The DAO with the capital-distributor plugin installed.
     */
    dao: IDao;
    /**
     * Initial parameters for the campaign list query.
     */
    initialParams?: IGetCampaignsListParams;
}

export const CapitalDistributorRewardsPageClient: React.FC<ICapitalDistributorRewardsPageClientProps> = (props) => {
    const { dao, initialParams } = props;

    const { address } = useAccount();
    const { t } = useTranslations();

    const plugin = useDaoPlugins({ daoId: dao.id, subdomain: capitalDistributorPlugin.id })![0];

    const pluginName = daoUtils.getPluginName(plugin.meta);
    const { description, links } = plugin.meta;

    return (
        <Page.Content>
            <Page.Main title={t('app.plugins.capitalDistributor.capitalDistributorRewardsPage.main.title')}>
                {!address && <CapitalDistributorRewardsNotConnected />}
                {address && <CapitalDistributorCampaignList initialParams={initialParams} dao={dao} />}
            </Page.Main>
            <Page.Aside>
                <Page.AsideCard title={pluginName}>
                    {description && <p className="text-base text-gray-500">{description}</p>}
                    {address && <CapitalDistributorRewardsStats initialParams={props.initialParams} />}
                    {links?.map(({ url, name }) => (
                        <Link key={url} href={url} isExternal={true} showUrl={true}>
                            {name}
                        </Link>
                    ))}
                </Page.AsideCard>
            </Page.Aside>
        </Page.Content>
    );
};
