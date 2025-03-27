import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface IAragonXPageHeaderStatProps extends ComponentProps<'div'> {
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

export const AragonXPageHeaderStat: React.FC<IAragonXPageHeaderStatProps> = (props) => {
    const { value = 0, label, suffix, className, ...otherProps } = props;

    return (
        <div
            className={classNames('flex flex-col gap-1 font-normal leading-tight text-neutral-0', className)}
            {...otherProps}
        >
            <div className="flex flex-row items-baseline gap-1 leading-tight">
                <p className="text-2xl md:text-4xl">{value}</p>
                {suffix && <p className="text-base md:text-lg">{suffix}</p>}
            </div>
            <p className="text-base md:text-lg">{label}</p>
        </div>
    );
};
