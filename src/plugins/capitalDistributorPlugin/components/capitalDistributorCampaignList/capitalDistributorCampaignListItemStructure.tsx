import type { IDao } from '@/shared/api/daoService/domain';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins/useDaoPlugins';
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
import { formatUnits } from 'viem';
import { CampaignStatus, type ICampaign } from '../../api/capitalDistributorService';
import { CapitalDistributorPluginDialogId } from '../../constants/capitalDistributorPluginDialogId';

export interface ICapitalDistributorCampaignListItemStructureProps {
    /**
     * The campaign data to display in the list item.
     */
    campaign: ICampaign;
    /**
     * The DAO with the capital-distributor plugin installed.
     */
    dao: IDao;
}

export const CapitalDistributorCampaignListItemStructure: React.FC<
    ICapitalDistributorCampaignListItemStructureProps
> = (props) => {
    const { campaign, dao } = props;
    const { id, network } = dao;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const { amount, token, txHash, logo, title, description } = campaign;

    const isClaimed = campaign.status === CampaignStatus.CLAIMED;

    const parsedAmount = formatUnits(BigInt(amount), token.decimals);
    const formattedAmount = formatterUtils.formatNumber(parsedAmount, { format: NumberFormat.TOKEN_AMOUNT_SHORT });

    const value = Number(parsedAmount) * Number(token.priceUsd);
    const formattedValue = formatterUtils.formatNumber(value, { format: NumberFormat.FIAT_TOTAL_SHORT });

    const { buildEntityUrl } = useBlockExplorer({ chainId: networkDefinitions[network].id });
    const addressLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: txHash });

    const capitalDistributorPlugin = useDaoPlugins({ daoId: id, subdomain: 'capital-distributor' })![0];

    const handleOpenDialog = () =>
        open(CapitalDistributorPluginDialogId.CLAIM, {
            params: { campaign, pluginAddress: capitalDistributorPlugin.meta.address },
        });

    return (
        <DataList.Item
            target="_blank"
            href={isClaimed ? addressLink : undefined}
            className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:gap-12"
            onClick={isClaimed ? undefined : handleOpenDialog}
        >
            <div className="flex w-full items-center gap-4">
                <Avatar src={logo} size="lg" />
                <div className="flex flex-col gap-1">
                    <h3 className="text-lg text-neutral-800">{title}</h3>
                    <p className="line-clamp-1 text-neutral-500">{description}</p>
                </div>
            </div>
            <div className="w-full border-t border-neutral-100 sm:hidden" />
            <div className="flex w-full items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex min-w-[120px] flex-col gap-1">
                        <h3 className="text-sm text-neutral-500 sm:text-base">
                            {t('app.plugins.capitalDistributor.capitalDistributorCampaignList.item.amount')}
                        </h3>
                        <p className="text-base text-neutral-800 sm:text-lg">{formattedAmount}</p>
                    </div>
                    <div className="flex min-w-[120px] flex-col gap-1">
                        <h3 className="text-sm text-neutral-500 sm:text-base">
                            {t('app.plugins.capitalDistributor.capitalDistributorCampaignList.item.value')}
                        </h3>
                        <p className="text-base text-neutral-800 sm:text-lg">{formattedValue}</p>
                    </div>
                </div>
                {isClaimed && <AvatarIcon size="sm" variant="primary" icon={IconType.LINK_EXTERNAL} />}
            </div>
        </DataList.Item>
    );
};
