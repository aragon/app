import {
    Button,
    DataList,
    IconType,
    type IDataListItemProps,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ICampaign } from '@/plugins/capitalDistributorPlugin/api/capitalDistributorService';

export type ICapitalDistributorCampaignListItemProps = IDataListItemProps & {
    /**
     * Campaign to display.
     */
    campaign: ICampaign;
    /**
     * Whether the campaign is selected.
     */
    isActive?: boolean;
    /**
     * Remove callback.
     */
    onRemove?: () => void;
};

export const CapitalDistributorCampaignListItem: React.FC<
    ICapitalDistributorCampaignListItemProps
> = (props) => {
    const { campaign, isActive, onRemove, className, ...otherProps } = props;

    return (
        <DataList.Item
            className={classNames('px-4 py-3 md:p-6', className, {
                'border-surface-selected shadow-primary hover:border-surface-selected hover:shadow-primary!':
                    isActive,
            })}
            {...otherProps}
        >
            <div className="flex items-center justify-between gap-12">
                <div className="flex flex-col gap-1 leading-tight font-normal">
                    <p className="text-lg text-neutral-800">
                        {campaign.title}{' '}
                        <span className="text-neutral-500">
                            #{campaign.campaignId}
                        </span>
                    </p>
                    <p className="line-clamp-1 text-sm text-neutral-500">
                        {campaign.description}
                    </p>
                </div>

                {onRemove && (
                    <Button
                        iconLeft={IconType.CLOSE}
                        onClick={onRemove}
                        size="sm"
                        variant="tertiary"
                    />
                )}
            </div>
        </DataList.Item>
    );
};
