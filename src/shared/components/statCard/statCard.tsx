import { Heading } from '@aragon/gov-ui-kit';

export interface IStat {
    /**
     * The value to display in the stat card.
     */
    value: string | number;
    /**
     * The label for the stat card.
     */
    label: string;
    /**
     * An optional suffix to display after the value.
     */
    suffix?: string;
}

export const StatCard: React.FC<IStat> = (props) => {
    const { value, suffix, label } = props;

    return (
        <div className="flex flex-col gap-y-1 rounded-xl bg-neutral-50 p-4">
            <Heading size="h3">
                {value}
                {suffix && <span className="text-xs text-neutral-500 md:text-sm">{suffix}</span>}
            </Heading>
            <p className="text-sm text-neutral-500">{label}</p>
        </div>
    );
};
