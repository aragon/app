import classNames from 'classnames';
import { Button } from '../../button';
import { IllustrationHuman, IllustrationObject } from '../../illustrations';
import type { IEmptyStateProps } from './emptyState.api';

/**
 * Usage notes:
 *
 * - `primaryButton` renders in both stacked and horizontal layouts; `isStacked` changes the surrounding layout and
 *   button sizes, not whether the action exists.
 * - Choose the mutually exclusive `humanIllustration` (with required `body`/`expression`) or `objectIllustration`
 *   (with `object`) shape; these values use exported TypeScript literal unions, not runtime enum objects.
 */
export const EmptyState: React.FC<IEmptyStateProps> = ({
    heading,
    description,
    primaryButton,
    secondaryButton,
    className,
    isStacked = true,
    objectIllustration,
    humanIllustration,
}) => {
    const containerClassNames = classNames(
        'grid w-full', // Defaults
        { 'grid-cols-1 justify-items-center p-6 text-center md:p-12': isStacked }, // Stacked
        { 'gap-group-stepped': isStacked && humanIllustration != null }, // Staked & Human illustration
        { 'grid-cols-[auto_64px] items-center gap-group px-inset-surface py-inset-surface--16-20': !isStacked }, // Horizontal
        { 'md:grid-cols-[auto_80px]': !isStacked }, // Responsive horizontal
        className,
    );

    return (
        <div className={containerClassNames}>
            {humanIllustration &&
                (isStacked ? (
                    <IllustrationHuman
                        className="mb-group-stepped h-auto w-full max-w-[400px]"
                        {...humanIllustration}
                    />
                ) : (
                    <div className="order-last flex aspect-square w-full max-w-20 items-center justify-center justify-self-end overflow-hidden rounded-full bg-surface-secondary">
                        <IllustrationHuman className="w-full scale-[1.25]" {...humanIllustration} />
                    </div>
                ))}
            {objectIllustration && (
                <IllustrationObject
                    className={classNames({
                        'h-auto w-full max-w-40': isStacked,
                        'order-last h-auto w-full max-w-20 justify-self-end rounded-full bg-surface-secondary':
                            !isStacked,
                    })}
                    {...objectIllustration}
                />
            )}

            <div
                className={classNames('flex flex-col', {
                    'w-full items-center': isStacked,
                    'space-y-section': (!!primaryButton || !!secondaryButton) && isStacked,
                    'space-y-group--12-16': (!!primaryButton || !!secondaryButton) && !isStacked,
                })}
            >
                <div
                    className={classNames({
                        'space-y-tight--4-8 flex flex-col items-center': isStacked,
                        'space-y-tight--2-4 items-start': !isStacked,
                    })}
                >
                    <p
                        className={classNames('leading-tight font-normal text-surface-primary', {
                            'text-xl md:text-2xl': isStacked,
                            'text-base md:text-lg': !isStacked,
                        })}
                    >
                        {heading}
                    </p>
                    <p
                        className={classNames('leading-tight font-normal text-surface-secondary', {
                            'text-sm md:text-base': isStacked,
                            'text-xs md:text-sm': !isStacked,
                        })}
                    >
                        {description}
                    </p>
                </div>
                <div
                    className={classNames({
                        'border-w-full space-y-related flex w-full flex-col items-stretch space-x-0 sm:w-fit md:space-x-group md:flex-row md:justify-center md:space-y-0':
                            isStacked,
                        'flex flex-row flex-wrap gap-related': !isStacked,
                    })}
                >
                    {primaryButton && (
                        <Button
                            {...primaryButton}
                            responsiveSize={isStacked ? { md: 'lg' } : { md: 'md' }}
                            size={isStacked ? 'lg' : 'sm'}
                            variant="primary"
                        >
                            {primaryButton.label}
                        </Button>
                    )}
                    {secondaryButton && (
                        <Button
                            {...secondaryButton}
                            responsiveSize={isStacked ? { md: 'lg' } : { md: 'md' }}
                            size={isStacked ? 'lg' : 'sm'}
                            variant="secondary"
                        >
                            {secondaryButton.label}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
