import { Heading } from '@aragon/gov-ui-kit';

export interface IStatCardProps {
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

export const StatCard: React.FC<IStatCardProps> = (props) => {
    const { value, suffix, label } = props;

    return (
        <div className="flex flex-col gap-y-tight rounded-xl bg-surface-secondary p-inset-surface-flat--fixed-16">
            <Heading size="h3">
                {value}
                {suffix && (
                    <span className="text-xs text-surface-secondary md:text-sm">
                        {suffix}
                    </span>
                )}
            </Heading>
            <p className="text-sm text-surface-secondary">{label}</p>
        </div>
    );
};
