'use client';

import { type IDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Toggle, ToggleGroup } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { CampaignStatus, type IGetCampaignsListParams } from '../../api/capitalDistributorService';
import { CapitalDistributorCampaignList } from '../../components/capitalDistributorCampaignList';
import { CapitalDistributorRewardsAside } from '../../components/capitalDistributorRewardsAside/capitalDistributorRewardsAside';
import { CapitalDistributorRewardsNotConnected } from '../../components/capitalDistributorRewardsNotConnected/capitalDistributorRewardsNotConnected';

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

    const [campaignFilter, setCampaignFilter] = useState<CampaignStatus>(CampaignStatus.CLAIMABLE);

    const handleToggleChange = (value?: string) => {
        if (value) {
            setCampaignFilter(value as CampaignStatus);
        }
    };

    return (
        <Page.Content>
            <Page.Main title={t('app.plugins.capitalDistributor.capitalDistributorRewardsPage.main.title')}>
                {!address && <CapitalDistributorRewardsNotConnected />}
                {address && (
                    <div className="flex flex-col gap-3">
                        <ToggleGroup
                            className="flex gap-3"
                            isMultiSelect={false}
                            onChange={handleToggleChange}
                            value={campaignFilter}
                        >
                            <Toggle
                                value={CampaignStatus.CLAIMABLE}
                                label={t(
                                    'app.plugins.capitalDistributor.capitalDistributorRewardsPage.main.tabs.claimable',
                                )}
                            />
                            <Toggle
                                value={CampaignStatus.CLAIMED}
                                label={t(
                                    'app.plugins.capitalDistributor.capitalDistributorRewardsPage.main.tabs.claimed',
                                )}
                            />
                        </ToggleGroup>
                        <CapitalDistributorCampaignList
                            initialParams={initialParams}
                            network={dao.network}
                            campaignFilter={campaignFilter}
                        />
                    </div>
                )}
            </Page.Main>
            <Page.Aside>
                <CapitalDistributorRewardsAside daoId={dao.id} initialParams={initialParams} />
            </Page.Aside>
        </Page.Content>
    );
};
