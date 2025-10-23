import { addressUtils, Avatar, Button, DataList, IconType, type IDataListItemProps } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { IRegisteredGauge } from '../../types/gaugeRegistrar';

export type IGaugeRegistrarGaugeListItemProps = IDataListItemProps & {
    /**
     * Gauge to display
     */
    gauge: IRegisteredGauge;
    /**
     * Whether the gauge is selected
     */
    isActive?: boolean;
    /**
     * Remove callback.
     */
    onRemove?: () => void;
};

export const GaugeRegistrarGaugeListItem: React.FC<IGaugeRegistrarGaugeListItemProps> = (props) => {
    const { gauge, isActive, onRemove, className, ...otherProps } = props;

    return (
        <DataList.Item
            className={classNames('px-4 py-3 md:p-6', className, {
                'border-primary-400 shadow-primary hover:border-primary-400 hover:shadow-primary': isActive,
            })}
            {...otherProps}
        >
            <div className="flex items-center justify-between gap-12">
                <div className="flex items-center gap-4">
                    <Avatar src={gauge.avatar as string} size="lg" />
                    <div className="flex flex-col gap-1 leading-tight font-normal">
                        <p className="text-lg text-neutral-800">{gauge.name}</p>
                        <p className="text-sm text-neutral-500">{addressUtils.truncateAddress(gauge.gaugeAddress)}</p>
                    </div>
                </div>

                {onRemove && <Button size="sm" iconLeft={IconType.CLOSE} onClick={onRemove} variant="tertiary" />}
            </div>
        </DataList.Item>
    );
};
