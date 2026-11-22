import {
    AddressOutput,
    Avatar,
    Button,
    DataList,
    IconType,
    type IDataListItemProps,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { IGauge } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';

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

export const GaugeVoterGaugeListItem: React.FC<
    IGaugeVoterGaugeListItemProps
> = (props) => {
    const { gauge, isActive, onRemove, className, ...otherProps } = props;
    const gaugeName = gauge.name ?? 'NA';
    const avatarSrc = ipfsUtils.cidToSrc(gauge.avatar);
    const avatarFallback = (
        <span className="flex size-full items-center justify-center bg-accent-solid text-accent-inverse">
            {gaugeName.slice(0, 2).toUpperCase()}
        </span>
    );

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
                <div className="flex items-center gap-group">
                    <Avatar
                        fallback={avatarFallback}
                        size="lg"
                        src={avatarSrc}
                    />
                    <div className="flex flex-col gap-tight">
                        <p className="type-title-item--picker-row text-surface-primary">
                            {gauge.name}
                        </p>
                        <p className="type-supporting--compact-detail text-surface-secondary">
                            <AddressOutput
                                address={gauge.address}
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
