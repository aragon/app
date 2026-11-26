import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface IAragonDemoPageHeaderStatProps extends ComponentProps<'div'> {
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

export const AragonDemoPageHeaderStat: React.FC<
    IAragonDemoPageHeaderStatProps
> = (props) => {
    const { value = 0, label, suffix, className, ...otherProps } = props;

    return (
        <div
            className={classNames(
                'flex flex-col gap-tight text-neutral-0',
                className,
            )}
            {...otherProps}
        >
            <div className="flex flex-row items-baseline gap-phrase">
                <p className="type-stat--dao-header">{value}</p>
                {suffix && (
                    <p className="type-caption--dao-header-stat">{suffix}</p>
                )}
            </div>
            <p className="type-caption--dao-header-stat">{label}</p>
        </div>
    );
};
