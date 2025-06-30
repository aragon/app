'use client';

import { CampaignStatus } from '@/plugins/capitalDistributorPlugin/api/capitalDistributorService';
import { CapitalDistributorCampaignList } from '@/plugins/capitalDistributorPlugin/components/capitalDistributorCampaignList';
import { CapitalDistributorRewardsAside } from '@/plugins/capitalDistributorPlugin/components/capitalDistributorRewardsAside/capitalDistributorRewardsAside';
import { CapitalDistributorRewardsNotConnected } from '@/plugins/capitalDistributorPlugin/components/capitalDistributorRewardsNotConnected/capitalDistributorRewardsNotConnected';
import { type IDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
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
    const { open } = useDialogContext();

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
                        <CapitalDistributorCampaignList dao={dao} campaignFilter={campaignFilter} />
                    </div>
                )}
            </Page.Main>
            <Page.Aside>
                <CapitalDistributorRewardsAside daoId={dao.id} />
            </Page.Aside>
        </Page.Content>
    );
};
