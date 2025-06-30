import { CampaignStatus, type ICampaign } from '@/plugins/capitalDistributorPlugin/api/capitalDistributorService';
import { useTranslations } from '@/shared/components/translationsProvider/translationsProvider';
import { Avatar, AvatarIcon, DataList, formatterUtils, IconType, NumberFormat } from '@aragon/gov-ui-kit';

export interface ICapitalDistributorCampaignListItemProps {
    /**
     * The campaign data to display in the list item.
     */
    campaign: ICampaign;
}

export const CapitalDistributorCampaignListItem: React.FC<ICapitalDistributorCampaignListItemProps> = (props) => {
    const { campaign } = props;

    const { t } = useTranslations();

    const isClaimed = campaign.status === CampaignStatus.CLAIMED;

    const formattedAmount = formatterUtils.formatNumber(campaign.amount, { format: NumberFormat.TOKEN_AMOUNT_SHORT });

    const value = Number(campaign.amount) * Number(campaign.token.priceUsd);
    const formattedValue = formatterUtils.formatNumber(value, { format: NumberFormat.FIAT_TOTAL_SHORT });

    return (
        <DataList.Item className="flex items-center gap-12 p-6">
            <div className="flex grow items-center gap-4">
                <Avatar src={campaign.logo} size="lg" />
                <div className="flex flex-col gap-1">
                    <h3 className="text-lg text-neutral-800">{campaign.title}</h3>
                    <p className="line-clamp-1 text-neutral-500">{campaign.description}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                    <h3 className="text-neutral-500">
                        {t('app.plugins.capitalDistributor.capitalDistributorCampaignListItem.amount')}
                    </h3>
                    <p className="text-lg text-neutral-800">{formattedAmount}</p>
                </div>
                <div className="flex flex-col gap-1">
                    <h3 className="text-neutral-500">
                        {t('app.plugins.capitalDistributor.capitalDistributorCampaignListItem.value')}
                    </h3>
                    <p className="text-lg text-neutral-800">{formattedValue}</p>
                </div>
                {isClaimed && <AvatarIcon size="sm" variant="primary" icon={IconType.LINK_EXTERNAL} />}
            </div>
        </DataList.Item>
    );
};
