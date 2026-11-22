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
            className={classNames(
                'px-inset-item py-inset-item--12-24',
                className,
                {
                    'border-surface-selected shadow-primary hover:border-surface-selected hover:!shadow-accent-default':
                        isActive,
                },
            )}
            {...otherProps}
        >
            <div className="flex items-center justify-between gap-section-wide--fixed-48">
                <div className="flex flex-col gap-tight leading-tight font-normal">
                    <p className="text-lg text-surface-primary">
                        {campaign.title}{' '}
                        <span className="text-surface-secondary">
                            #{campaign.campaignId}
                        </span>
                    </p>
                    <p className="line-clamp-1 text-sm text-surface-secondary">
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
