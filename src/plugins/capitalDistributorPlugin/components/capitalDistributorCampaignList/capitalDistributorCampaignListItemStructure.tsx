import { type IDao, PluginInterfaceType } from '@/shared/api/daoService/domain';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins/useDaoPlugins';
import {
    Avatar,
    AvatarIcon,
    ChainEntityType,
    DataList,
    formatterUtils,
    IconType,
    NumberFormat,
} from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import { CampaignStatus, type ICampaign } from '../../api/capitalDistributorService';
import { CapitalDistributorPluginDialogId } from '../../constants/capitalDistributorPluginDialogId';
import type { ICapitalDistributorClaimDialogParams } from '../../dialogs/capitalDistributorClaimDialog';

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
    const plugin = useDaoPlugins({ daoId: id, interfaceType: PluginInterfaceType.CAPITAL_DISTRIBUTOR })![0];

    const { userData, token, title, description } = campaign;
    const { totalAmount, totalClaimed, claims, status } = userData;

    const isClaimed = status === CampaignStatus.CLAIMED;

    const amount = isClaimed ? totalClaimed : totalAmount;
    const parsedAmount = formatUnits(BigInt(amount), token.decimals);
    const formattedAmount = formatterUtils.formatNumber(parsedAmount, { format: NumberFormat.TOKEN_AMOUNT_SHORT });

    const value = Number(parsedAmount) * Number(token.priceUsd);
    const formattedValue = formatterUtils.formatNumber(value, { format: NumberFormat.FIAT_TOTAL_SHORT });

    const { buildEntityUrl } = useDaoChain({ network });
    const addressLink = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: claims[0]?.transactionHash });

    const handleOpenDialog = () => {
        const { network } = dao;
        const dialogParams: ICapitalDistributorClaimDialogParams = { campaign, plugin: plugin.meta, network };
        open(CapitalDistributorPluginDialogId.CLAIM, { params: dialogParams });
    };

    return (
        <DataList.Item
            target="_blank"
            href={isClaimed ? addressLink : undefined}
            className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:gap-12"
            onClick={isClaimed ? undefined : handleOpenDialog}
        >
            <div className="flex w-full min-w-0 items-center gap-4">
                <Avatar src={token.logo} size="lg" />
                <div className="flex min-w-0 flex-col gap-1">
                    <h3 className="text-lg text-neutral-800">{title}</h3>
                    <p className="line-clamp-1 text-neutral-500">{description}</p>
                </div>
            </div>
            <div className="w-full border-t border-neutral-100 sm:hidden" />
            <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:gap-8">
                <div className="flex grow items-center gap-4">
                    <div className="flex min-w-20 flex-col gap-1">
                        <h3 className="text-sm text-neutral-500 sm:text-base">
                            {t('app.plugins.capitalDistributor.capitalDistributorCampaignList.item.amount')}
                        </h3>
                        <p className="text-base text-neutral-800 sm:text-lg">{formattedAmount}</p>
                    </div>
                    <div className="flex min-w-20 flex-col gap-1">
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
