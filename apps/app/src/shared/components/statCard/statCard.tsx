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
        <div className="flex flex-col gap-y-1 rounded-xl bg-surface-secondary p-4">
            <Heading
                as="h3"
                className="type-numeric"
                typeClassName="type-stat--stat-card"
            >
                {value}
                {suffix && (
                    <span className="type-caption--framework-leading text-surface-secondary">
                        {suffix}
                    </span>
                )}
            </Heading>
            <p className="type-caption--compact-label text-surface-secondary">
                {label}
            </p>
        </div>
    );
};
