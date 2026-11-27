import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface IAragonDemoPoliciesPageHeaderStatProps
    extends ComponentProps<'div'> {
    /**
     * Value of the stat.
     * @default 0
     */
    value?: number | string | null;
    /**
     * Label displayed under the value.
     */
    label: string;
    /**
     * Optional suffix of the stat displayed beside its value.
     */
    suffix?: string;
}

export const AragonDemoPoliciesPageHeaderStat: React.FC<
    IAragonDemoPoliciesPageHeaderStatProps
> = (props) => {
    const { value = 0, label, suffix, className, ...otherProps } = props;

    return (
        <div
            className={classNames(
                'flex flex-col gap-1 text-neutral-0',
                className,
            )}
            {...otherProps}
        >
            <div className="flex flex-row items-baseline gap-1">
                <p className="type-stat--dao-header">{value}</p>
                {suffix && (
                    <p className="type-caption--dao-header-stat">{suffix}</p>
                )}
            </div>
            <p className="type-caption--dao-header-stat">{label}</p>
        </div>
    );
};
