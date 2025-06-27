'use client';

import { useCampaignList } from '@/plugins/capitalDistributorPlugin/api/capitalDistributorService';
import { CapitalDistributorRewardsAside } from '@/plugins/capitalDistributorPlugin/components/capitalDistributorRewardsAside/capitalDistributorRewardsAside';
import { CapitalDistributorRewardsNotConnected } from '@/plugins/capitalDistributorPlugin/components/capitalDistributorRewardsNotConnected/capitalDistributorRewardsNotConnected';
import { type IDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Toggle, ToggleGroup } from '@aragon/gov-ui-kit';
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

    const [campaignFilter, setCampaignFilter] = useState<'claimed' | 'claimable'>('claimable');

    const handleToggleChange = (value?: string) => {
        if (value) {
            setCampaignFilter(value as 'claimed' | 'claimable');
        }
    };

    const campaignParams = { queryParams: { memberAddress: address!, status: campaignFilter } };
    const { data: campaigns } = useCampaignList(campaignParams, { enabled: address != null });

    return (
        <>
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
                                    value="claimable"
                                    label={t(
                                        'app.plugins.capitalDistributor.capitalDistributorRewardsPage.main.tabs.claimable',
                                    )}
                                />
                                <Toggle
                                    value="claimed"
                                    label={t(
                                        'app.plugins.capitalDistributor.capitalDistributorRewardsPage.main.tabs.claimed',
                                    )}
                                />
                            </ToggleGroup>
                            {/* TODO: Replace with data list item component when done */}
                            {campaigns?.map((campaign) => (
                                <div key={campaign.id} className="rounded-lg border p-4">
                                    <h3 className="text-lg font-semibold">{campaign.title}</h3>
                                </div>
                            ))}
                        </div>
                    )}
                </Page.Main>
                <Page.Aside>
                    <CapitalDistributorRewardsAside daoId={dao.id} />
                </Page.Aside>
            </Page.Content>
        </>
    );
};
