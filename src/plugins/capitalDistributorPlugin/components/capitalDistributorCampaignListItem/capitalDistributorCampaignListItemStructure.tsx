import type { IDao } from '@/shared/api/daoService/domain/dao';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    Avatar,
    AvatarIcon,
    ChainEntityType,
    DataList,
    formatterUtils,
    IconType,
    NumberFormat,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';
import { CampaignStatus, type ICampaign } from '../../api/capitalDistributorService';
import { CapitalDistributorPluginDialogId } from '../../constants/capitalDistributorPluginDialogId';

export interface ICapitalDistributorCampaignListItemStructureProps {
    /**
     * The campaign data to display in the list item.
     */
    campaign: ICampaign;
    /**
     * The DAO the campaign belongs to.
     */
    dao: IDao;
}

export const CapitalDistributorCampaignListItemStructure: React.FC<
    ICapitalDistributorCampaignListItemStructureProps
> = (props) => {
    const { campaign, dao } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const isClaimed = campaign.status === CampaignStatus.CLAIMED;

    const formattedAmount = formatterUtils.formatNumber(campaign.amount, { format: NumberFormat.TOKEN_AMOUNT_SHORT });

    const value = Number(campaign.amount) * Number(campaign.token.priceUsd);
    const formattedValue = formatterUtils.formatNumber(value, { format: NumberFormat.FIAT_TOTAL_SHORT });

    const { buildEntityUrl } = useBlockExplorer({ chainId: networkDefinitions[dao.network].id });
    const addressLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: campaign.txHash });

    const handleOpenDialog = () => open(CapitalDistributorPluginDialogId.CLAIM, { params: { campaign } });

    return (
        <DataList.Item
            target="_blank"
            href={isClaimed ? addressLink : undefined}
            className="flex items-center gap-12 p-6"
            onClick={isClaimed ? undefined : handleOpenDialog}
        >
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
