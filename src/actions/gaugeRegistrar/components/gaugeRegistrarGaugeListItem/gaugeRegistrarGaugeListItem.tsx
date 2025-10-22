import { useTranslations } from '@/shared/components/translationsProvider';
import { addressUtils, Button, DataList, IconType, type IDataListItemProps } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { GaugeIncentiveType } from '../../types/enum/gaugeIncentiveType';
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

    const { t } = useTranslations();

    const incentiveLabel =
        gauge.incentive === GaugeIncentiveType.SUPPLY
            ? t('app.plugins.gaugeRegistrar.gaugeListItem.incentive.supply')
            : t('app.plugins.gaugeRegistrar.gaugeListItem.incentive.borrow');

    return (
        <DataList.Item
            className={classNames('px-4 py-3 md:p-6', className, {
                'border-primary-400 shadow-primary hover:border-primary-400 hover:shadow-primary': isActive,
            })}
            {...otherProps}
        >
            <div className="flex justify-between">
                <div className="flex flex-col gap-y-2">
                    <div className="flex flex-col gap-1">
                        <p className="text-lg leading-tight font-semibold text-neutral-800">
                            {addressUtils.truncateAddress(gauge.gaugeAddress)}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                            <span className="font-medium">{incentiveLabel}</span>
                            <span>•</span>
                            <span>{t('app.plugins.gaugeRegistrar.gaugeListItem.qiToken')}</span>
                            <span className="font-mono">{addressUtils.truncateAddress(gauge.qiToken)}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 text-sm text-neutral-500">
                        <div className="flex gap-2">
                            <span className="font-medium">
                                {t('app.plugins.gaugeRegistrar.gaugeListItem.rewardController')}:
                            </span>
                            <span className="font-mono">{addressUtils.truncateAddress(gauge.rewardController)}</span>
                        </div>
                    </div>
                </div>
                {onRemove && <Button size="md" iconLeft={IconType.CLOSE} onClick={onRemove} variant="tertiary" />}
            </div>
        </DataList.Item>
    );
};
