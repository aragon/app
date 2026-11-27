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
import type { IDao } from '@/shared/api/daoService/domain';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins/useDaoPlugins';
import {
    CampaignStatus,
    type ICampaign,
} from '../../api/capitalDistributorService';
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
    /**
     * The address of the CD plugin.
     */
    pluginAddress: string;
}

export const CapitalDistributorCampaignListItemStructure: React.FC<
    ICapitalDistributorCampaignListItemStructureProps
> = (props) => {
    const { campaign, dao, pluginAddress } = props;
    const { id, network } = dao;

    const { t } = useTranslations();
    const { open } = useDialogContext();
    const plugin = useDaoPlugins({
        daoId: id,
        pluginAddress,
    })![0];

    const { userData, token, title, description } = campaign;
    const { totalAmount, totalClaimed, claims, status } = userData;

    const isClaimed = status === CampaignStatus.CLAIMED;

    const amount = isClaimed ? totalClaimed : totalAmount;
    const parsedAmount = formatUnits(BigInt(amount), token.decimals);
    const formattedAmount = formatterUtils.formatNumber(parsedAmount, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
    });

    const value = Number(parsedAmount) * Number(token.priceUsd);
    const formattedValue = formatterUtils.formatNumber(value, {
        format: NumberFormat.FIAT_TOTAL_SHORT,
    });

    const { buildEntityUrl } = useDaoChain({ network });
    const addressLink = buildEntityUrl({
        type: ChainEntityType.TRANSACTION,
        id: claims[0]?.transactionHash,
    });

    const handleOpenDialog = () => {
        const { network } = dao;
        const dialogParams: ICapitalDistributorClaimDialogParams = {
            campaign,
            plugin: plugin.meta,
            network,
        };
        open(CapitalDistributorPluginDialogId.CLAIM, { params: dialogParams });
    };

    return (
        <DataList.Item
            className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:gap-12"
            href={isClaimed ? addressLink : undefined}
            onClick={isClaimed ? undefined : handleOpenDialog}
            target="_blank"
        >
            <div className="flex w-full min-w-0 items-center gap-4">
                <Avatar size="lg" src={token.logo} />
                <div className="flex min-w-0 flex-col gap-1">
                    <h3 className="type-title-item--picker-row text-surface-primary">
                        {title}
                    </h3>
                    <p className="line-clamp-1 text-surface-secondary">
                        {description}
                    </p>
                </div>
            </div>
            <div className="w-full border-t border-surface-secondary sm:hidden" />
            <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:gap-8">
                <div className="flex grow items-center gap-4">
                    <div className="flex min-w-20 flex-col gap-1">
                        <h3 className="type-supporting--sm-step-label text-surface-secondary sm:type-supporting--sm-step-label-wide">
                            {t(
                                'app.plugins.capitalDistributor.capitalDistributorCampaignList.item.amount',
                            )}
                        </h3>
                        <p className="type-supporting--sm-step-value text-surface-primary sm:type-supporting--sm-step-value-wide">
                            {formattedAmount}
                        </p>
                    </div>
                    <div className="flex min-w-20 flex-col gap-1">
                        <h3 className="type-supporting--sm-step-label text-surface-secondary sm:type-supporting--sm-step-label-wide">
                            {t(
                                'app.plugins.capitalDistributor.capitalDistributorCampaignList.item.value',
                            )}
                        </h3>
                        <p className="type-supporting--sm-step-value text-surface-primary sm:type-supporting--sm-step-value-wide">
                            {formattedValue}
                        </p>
                    </div>
                </div>
                {isClaimed && (
                    <AvatarIcon
                        icon={IconType.LINK_EXTERNAL}
                        size="sm"
                        variant="primary"
                    />
                )}
            </div>
        </DataList.Item>
    );
};
