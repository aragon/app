import {
    Button,
    Card,
    Heading,
    IconType,
    IllustrationObject,
    type IllustrationObjectType,
    Tag,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';

export interface ICtaCardProps {
    /**
     * Illustration object type to render in the card header.
     */
    objectType: IllustrationObjectType;
    /**
     * Title of the card.
     */
    title: string;
    /**
     * Description text.
     */
    description: string;
    /**
     * Whether to use primary variant styling (border + shadow).
     */
    isPrimary: boolean;
    /**
     * Primary action button configuration.
     */
    primaryAction: {
        /**
         * Label for the primary action button.
         */
        label: string;
        /**
         * URL for the primary action button (opens external link).
         */
        href?: string;
        /**
         * Callback for the primary action button.
         */
        onClick?: () => void;
    };
    /**
     * Optional tag label displayed in the top-right corner.
     */
    tag?: string;
    /**
     * Optional secondary action button (always opens external link).
     */
    secondaryAction?: {
        /**
         * Label for the secondary action button.
         */
        label: string;
        /**
         * URL for the secondary action button.
         */
        href: string;
    };
    /**
     * Text size variant. `normal` uses h1-sized heading and responsive description;
     * `smaller` uses h2-sized heading and base description. Defaults to `normal`.
     */
    textSize?: 'normal' | 'smaller';
    /**
     * Custom class name for the component.
     */
    className?: string;
}

export const CtaCard: React.FC<ICtaCardProps> = (props) => {
    const {
        objectType,
        title,
        description,
        isPrimary,
        primaryAction,
        tag,
        secondaryAction,
        textSize = 'normal',
        className,
    } = props;

    const isExternal = primaryAction.href != null;
    const isSmaller = textSize === 'smaller';

    return (
        <Card
            className={classNames(
                'relative flex flex-col gap-group-stepped',
                { 'border-primary-200 shadow-primary': isPrimary },
                className,
            )}
            inset="surface"
        >
            {tag != null && (
                <Tag
                    className="absolute top-4 right-4 md:top-6 md:right-6"
                    label={tag}
                    variant="primary"
                />
            )}
            <IllustrationObject
                className="size-16 rounded-full bg-neutral-50 md:size-24"
                object={objectType}
            />
            <div className="flex flex-col gap-related">
                <Heading as="h2" size={isSmaller ? 'h2' : 'h1'}>
                    {title}
                </Heading>
                <p
                    className={classNames(
                        'leading-normal text-neutral-500',
                        { 'text-sm md:text-base': isSmaller },
                        { 'text-base md:text-lg': !isSmaller },
                    )}
                >
                    {description}
                </p>
            </div>
            <div className="mt-auto flex flex-col gap-related md:flex-row">
                <Button
                    className="w-full md:w-auto"
                    {...(isExternal
                        ? {
                              href: primaryAction.href!,
                              iconRight: IconType.LINK_EXTERNAL,
                              target: '_blank',
                          }
                        : { onClick: primaryAction.onClick })}
                    size="md"
                    variant={isPrimary ? 'primary' : 'secondary'}
                >
                    {primaryAction.label}
                </Button>
                {secondaryAction != null && (
                    <Button
                        className="w-full md:w-auto"
                        href={secondaryAction.href}
                        iconRight={IconType.LINK_EXTERNAL}
                        size="md"
                        target="_blank"
                        variant="tertiary"
                    >
                        {secondaryAction.label}
                    </Button>
                )}
            </div>
        </Card>
    );
};
