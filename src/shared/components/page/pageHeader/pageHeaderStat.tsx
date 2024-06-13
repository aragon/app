import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface IPageHeaderStat {
    /**
     * Value of the stat.
     */
    value: number | string;
    /**
     * Label displayed under the value.
     */
    label: string;
    /**
     * Optional suffix of the stat displayed beside its value.
     */
    suffix?: string;
}

export interface IPageHeaderStatProps extends IPageHeaderStat, ComponentProps<'div'> {}

export const PageHeaderStat: React.FC<IPageHeaderStatProps> = (props) => {
    const { value, label, suffix, className, ...otherProps } = props;

    return (
        <div className={classNames('flex flex-col gap-1 font-normal leading-tight', className)} {...otherProps}>
            <div className="flex flex-row items-baseline gap-1">
                <p className="text-2xl text-neutral-800">{value}</p>
                {suffix && <p className="text-base text-neutral-500">{suffix}</p>}
            </div>
            <p className="text-sm text-neutral-500">{label}</p>
        </div>
    );
};
