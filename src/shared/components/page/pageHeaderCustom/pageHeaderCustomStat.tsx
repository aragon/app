import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface IPageHeaderCustomStat {
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

export interface IPageHeaderCustomStatProps extends IPageHeaderCustomStat, ComponentProps<'div'> {}

export const PageHeaderCustomStat: React.FC<IPageHeaderCustomStatProps> = (props) => {
    const { value, label, suffix, className, ...otherProps } = props;
    const parsedValue = value ?? 0;

    return (
        <div className={classNames('flex flex-col gap-1 font-normal leading-tight', className)} {...otherProps}>
            <div className="flex flex-row items-baseline gap-1">
                <p className="text-2xl text-neutral-0 md:text-4xl">{parsedValue}</p>
                {suffix && <p className="text-base text-neutral-0">{suffix}</p>}
            </div>
            <p className="text-base text-neutral-0">{label}</p>
        </div>
    );
};
