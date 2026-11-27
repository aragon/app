import classNames from 'classnames';

export type TagVariant = 'neutral' | 'info' | 'warning' | 'critical' | 'success' | 'primary';

export interface ITagProps {
    /**
     * Defines the variant of the tag.
     * @default neutral
     */
    variant?: TagVariant;
    /**
     * Label of the tag.
     */
    label: string;
    /**
     * Classes for the component.
     */
    className?: string;
}

const variantToClassName: Record<TagVariant, string> = {
    neutral: 'bg-surface-tertiary text-surface-primary',
    info: 'bg-info-subtle-tag text-info-primary',
    warning: 'bg-warning-subtle-tag text-warning-primary',
    critical: 'bg-critical-subtle-tag text-critical-primary',
    success: 'bg-success-subtle-tag text-success-primary',
    primary: 'bg-accent-subtle text-accent-primary',
};

export const Tag: React.FC<ITagProps> = (props) => {
    const { label, variant = 'neutral', className } = props;

    return (
        <div
            className={classNames(
                'flex h-tag items-center rounded-full px-tag',
                variantToClassName[variant],
                className,
            )}
        >
            <p className="type-supporting">{label}</p>
        </div>
    );
};
