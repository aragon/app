import type { IGauge } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService/domain';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { addressUtils, Avatar, Button, DataList, IconType, type IDataListItemProps } from '@aragon/gov-ui-kit';
import classNames from 'classnames';

export type IGaugeVoterGaugeListItemProps = IDataListItemProps & {
    /**
     * Gauge to display.
     */
    gauge: IGauge;
    /**
     * Whether the gauge is selected.
     */
    isActive?: boolean;
    /**
     * Remove callback.
     */
    onRemove?: () => void;
};

export const GaugeVoterGaugeListItem: React.FC<IGaugeVoterGaugeListItemProps> = (props) => {
    const { gauge, isActive, onRemove, className, ...otherProps } = props;
    const gaugeName = gauge.name ?? 'NA';
    const avatarSrc = ipfsUtils.cidToSrc(gauge.avatar);
    const avatarFallback = (
        <span className="bg-primary-400 text-neutral-0 flex size-full items-center justify-center">
            {gaugeName.slice(0, 2).toUpperCase()}
        </span>
    );

    return (
        <DataList.Item
            className={classNames('px-4 py-3 md:p-6', className, {
                'border-primary-400 shadow-primary hover:border-primary-400 hover:shadow-primary': isActive,
            })}
            {...otherProps}
        >
            <div className="flex items-center justify-between gap-12">
                <div className="flex items-center gap-4">
                    <Avatar src={avatarSrc} fallback={avatarFallback} size="lg" />
                    <div className="flex flex-col gap-1 leading-tight font-normal">
                        <p className="text-lg text-neutral-800">{gauge.name}</p>
                        <p className="text-sm text-neutral-500">{addressUtils.truncateAddress(gauge.address)}</p>
                    </div>
                </div>

                {onRemove && <Button size="sm" iconLeft={IconType.CLOSE} onClick={onRemove} variant="tertiary" />}
            </div>
        </DataList.Item>
    );
};
