'use client';

import { ApplicationDialogId } from '@/modules/application/constants/applicationDialogId';
import { type IDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { daoUtils } from '@/shared/utils/daoUtils';
import { CardEmptyState, IconType, Link } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';
import { type IGetCampaignsListParams } from '../../api/capitalDistributorService';
import { CapitalDistributorCampaignList } from '../../components/capitalDistributorCampaignList';
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
    const { open } = useDialogContext();

    const plugin = useDaoPlugins({ daoId: dao.id, subdomain: capitalDistributorPlugin.id })![0];

    const pluginName = daoUtils.getPluginName(plugin.meta);
    const { description, links } = plugin.meta;

    const connectAction = {
        label: t('app.plugins.capitalDistributor.capitalDistributorRewardsPage.main.connect.action'),
        onClick: () => open(ApplicationDialogId.CONNECT_WALLET),
        iconLeft: IconType.BLOCKCHAIN_WALLET,
    };

    return (
        <Page.Content>
            <Page.Main title={t('app.plugins.capitalDistributor.capitalDistributorRewardsPage.main.title')}>
                {!address && (
                    <CardEmptyState
                        heading={t('app.plugins.capitalDistributor.capitalDistributorRewardsPage.main.connect.heading')}
                        description={t(
                            'app.plugins.capitalDistributor.capitalDistributorRewardsPage.main.connect.description',
                        )}
                        objectIllustration={{ object: 'WALLET' }}
                        primaryButton={connectAction}
                    />
                )}
                {address && <CapitalDistributorCampaignList initialParams={initialParams} dao={dao} />}
            </Page.Main>
            <Page.Aside>
                <Page.AsideCard title={pluginName}>
                    {description && <p className="text-base text-gray-500">{description}</p>}
                    {address && <CapitalDistributorRewardsStats initialParams={initialParams} />}
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
