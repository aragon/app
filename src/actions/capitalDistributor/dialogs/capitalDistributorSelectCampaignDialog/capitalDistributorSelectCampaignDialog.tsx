'use client';

import { DataList, Dialog, invariant } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { ICampaign } from '@/plugins/capitalDistributorPlugin/api/capitalDistributorService';
import { useAllCampaigns } from '@/plugins/capitalDistributorPlugin/api/capitalDistributorService';
import type { IDao } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    CapitalDistributorCampaignListItem,
    CapitalDistributorCampaignListItemSkeleton,
} from '../../components/capitalDistributorCampaignListItem';

export interface ICapitalDistributorSelectCampaignDialogParams {
    /**
     * Address of the capital distributor plugin contract.
     */
    pluginAddress: string;
    /**
     * DAO to select campaigns for.
     */
    dao: IDao;
    /**
     * Optional filter to show only active or inactive campaigns.
     */
    activityStatus?: 'active' | 'inactive';
    /**
     * Callback called when a campaign is selected.
     */
    onCampaignSelected?: (campaign: ICampaign) => void;
}

export interface ICapitalDistributorSelectCampaignDialogProps
    extends IDialogComponentProps<ICapitalDistributorSelectCampaignDialogParams> {}

export const CapitalDistributorSelectCampaignDialog: React.FC<
    ICapitalDistributorSelectCampaignDialogProps
> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'CapitalDistributorSelectCampaignDialog: params must be defined',
    );

    const { pluginAddress, dao, activityStatus, onCampaignSelected } =
        location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const { data: allCampaigns, isLoading } = useAllCampaigns({
        campaignListParams: {
            queryParams: {
                pluginAddress,
                network: dao.network,
                onlyActive: activityStatus === 'active',
            },
        },
    });

    const campaigns =
        activityStatus === 'inactive'
            ? allCampaigns.filter(
                  (campaign) => !campaign.active && !campaign.ended,
              )
            : allCampaigns;

    const [selectedCampaign, setSelectedCampaign] = useState<ICampaign | null>(
        null,
    );

    const handleSubmit = () => {
        if (selectedCampaign != null) {
            onCampaignSelected?.(selectedCampaign);
        }
        close();
    };

    return (
        <>
            <Dialog.Header
                onClose={close}
                title={t(
                    'app.actions.capitalDistributor.capitalDistributorSelectCampaignDialog.title',
                )}
            />
            <Dialog.Content
                description={t(
                    'app.actions.capitalDistributor.capitalDistributorSelectCampaignDialog.description',
                )}
            >
                <div className="flex w-full flex-col gap-3 py-2 md:gap-2">
                    {isLoading && (
                        <DataList.Root
                            entityLabel={t(
                                'app.actions.capitalDistributor.capitalDistributorSelectCampaignDialog.entityLabel',
                            )}
                        >
                            <CapitalDistributorCampaignListItemSkeleton />
                            <CapitalDistributorCampaignListItemSkeleton />
                            <CapitalDistributorCampaignListItemSkeleton />
                        </DataList.Root>
                    )}
                    {!isLoading && campaigns.length > 0 && (
                        <DataList.Root
                            entityLabel={t(
                                'app.actions.capitalDistributor.capitalDistributorSelectCampaignDialog.entityLabel',
                            )}
                        >
                            {campaigns.map((campaign: ICampaign) => (
                                <CapitalDistributorCampaignListItem
                                    campaign={campaign}
                                    isActive={
                                        selectedCampaign?.campaignId ===
                                        campaign.campaignId
                                    }
                                    key={campaign.campaignId}
                                    onClick={() =>
                                        setSelectedCampaign(campaign)
                                    }
                                />
                            ))}
                        </DataList.Root>
                    )}
                    {!isLoading && campaigns.length === 0 && (
                        <div className="flex items-center justify-center py-8 text-neutral-500">
                            {t(
                                `app.actions.capitalDistributor.capitalDistributorSelectCampaignDialog.${activityStatus === 'active' ? 'emptyStateActive' : 'emptyStateInactive'}`,
                            )}
                        </div>
                    )}
                </div>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t(
                        'app.actions.capitalDistributor.capitalDistributorSelectCampaignDialog.submit',
                    ),
                    onClick: handleSubmit,
                    disabled: selectedCampaign == null,
                }}
                secondaryAction={{
                    label: t(
                        'app.actions.capitalDistributor.capitalDistributorSelectCampaignDialog.cancel',
                    ),
                    onClick: () => close(),
                }}
            />
        </>
    );
};
