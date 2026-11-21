import {
    AddressOutput,
    Avatar,
    Button,
    DataList,
    IconType,
    type IDataListItemProps,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import type { IRegisteredGauge } from '../../types/gaugeRegistrar';

export type IGaugeRegistrarGaugeListItemProps = IDataListItemProps & {
    /**
     * Gauge to display.
     */
    gauge: IRegisteredGauge;
    /**
     * Whether the gauge is selected.
     */
    isActive?: boolean;
    /**
     * Remove callback.
     */
    onRemove?: () => void;
};

export const GaugeRegistrarGaugeListItem: React.FC<
    IGaugeRegistrarGaugeListItemProps
> = (props) => {
    const { gauge, isActive, onRemove, className, ...otherProps } = props;
    const gaugeName = gauge.name ?? 'NA';
    const avatarSrc = ipfsUtils.cidToSrc(gauge.avatar);
    const avatarFallback = (
        <span className="flex size-full items-center justify-center bg-primary-400 text-neutral-0">
            {gaugeName.slice(0, 2).toUpperCase()}
        </span>
    );

    return (
        <DataList.Item
            className={classNames(
                'px-inset-item py-inset-item--12-24',
                className,
                {
                    'border-primary-400 shadow-primary hover:border-primary-400 hover:shadow-primary':
                        isActive,
                },
            )}
            {...otherProps}
        >
            <div className="flex items-center justify-between gap-section-wide--fixed-48">
                <div className="flex items-center gap-group">
                    <Avatar
                        fallback={avatarFallback}
                        size="lg"
                        src={avatarSrc}
                    />
                    <div className="flex flex-col gap-tight leading-tight font-normal">
                        <p className="text-lg text-neutral-800">{gauge.name}</p>
                        <p className="text-sm text-neutral-500">
                            <AddressOutput
                                address={gauge.gaugeAddress}
                                copy={false}
                            />
                        </p>
                    </div>
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
