'use client';

import { CampaignStatus, useCampaignList } from '@/plugins/capitalDistributorPlugin/api/capitalDistributorService';
import { CapitalDistributorRewardsAside } from '@/plugins/capitalDistributorPlugin/components/capitalDistributorRewardsAside/capitalDistributorRewardsAside';
import { CapitalDistributorRewardsNotConnected } from '@/plugins/capitalDistributorPlugin/components/capitalDistributorRewardsNotConnected/capitalDistributorRewardsNotConnected';
import { type IDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DataListItem, Toggle, ToggleGroup } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useAccount } from 'wagmi';

export interface ICapitalDistributorRewardsPageClientProps {
    /**
     * DAO to display the rewards page for.
     */
    dao: IDao;
}

export const CapitalDistributorRewardsPageClient: React.FC<ICapitalDistributorRewardsPageClientProps> = (props) => {
    const { dao } = props;
    const { address } = useAccount();
    const { t } = useTranslations();

    const [campaignFilter, setCampaignFilter] = useState<CampaignStatus>(CampaignStatus.CLAIMABLE);

    const handleToggleChange = (value?: string) => {
        if (value) {
            setCampaignFilter(value as CampaignStatus);
        }
    };

    const campaignParams = { queryParams: { memberAddress: address!, status: campaignFilter } };
    const { data: campaigns } = useCampaignList(campaignParams, { enabled: address != null });

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
                        {/* TODO: Replace with data list item component when done */}
                        {campaigns?.map((campaign) => (
                            <DataListItem key={campaign.id} className="p-6">
                                <p className="text-neutral-800">{campaign.title}</p>
                            </DataListItem>
                        ))}
                    </div>
                )}
            </Page.Main>
            <Page.Aside>
                <CapitalDistributorRewardsAside daoId={dao.id} />
            </Page.Aside>
        </Page.Content>
    );
};
