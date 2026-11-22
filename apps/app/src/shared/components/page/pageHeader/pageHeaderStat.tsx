import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface IPageHeaderStat {
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

export interface IPageHeaderStatProps
    extends IPageHeaderStat,
        ComponentProps<'div'> {}

export const PageHeaderStat: React.FC<IPageHeaderStatProps> = (props) => {
    const { value, label, suffix, className, ...otherProps } = props;
    const parsedValue = value ?? 0;

    return (
        <div
            className={classNames(
                'flex flex-col gap-tight leading-tight font-normal',
                className,
            )}
            {...otherProps}
        >
            <div className="flex flex-row flex-wrap items-baseline gap-x-phrase">
                <p className="text-lg text-neutral-800 md:text-xl">
                    {parsedValue}
                </p>
                {suffix && (
                    <p className="overflow-hidden text-xs text-ellipsis text-neutral-500 md:text-sm">
                        {suffix}
                    </p>
                )}
            </div>
            <p className="overflow-hidden text-xs text-ellipsis text-neutral-500 md:text-sm">
                {label}
            </p>
        </div>
    );
};
