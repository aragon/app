import { Button, Heading, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import Image from 'next/image';
import type React from 'react';

export interface ICtaCardProps {
    /**
     * Headline image source.
     */
    imgSrc: string;
    /**
     * Title of the card.
     */
    title: string;
    /**
     * Subtitle of the card.
     */
    subtitle: string;
    /**
     * Flag to determine if the action button is primary or secondary.
     */
    isPrimary: boolean;
    /**
     * Label for the action button.
     */
    actionLabel: string;
    /**
     * Path to navigate to when the action button is clicked.
     */
    actionHref?: string;
    /**
     * Callback function to execute when the action button is clicked.
     */
    actionOnClick?: () => void;
    /**
     * Custom class name for the component.
     */
    className?: string;
}

/**
 * Might be promoted to a shared component in the future!
 */
export const CtaCard: React.FC<ICtaCardProps> = (props) => {
    const { imgSrc, title, subtitle, isPrimary, actionHref, actionLabel, actionOnClick, className } = props;

    return (
        <div
            className={classNames(
                'flex flex-1 shrink-0 flex-col items-start self-stretch',
                'bg-neutral-0 shadow-neutral rounded-xl',
                'gap-4 p-4 md:gap-6 md:p-6',
                className,
            )}
        >
            <div
                className={classNames(
                    'flex items-center justify-center',
                    'rounded-full bg-neutral-50',
                    'size-16 md:size-24',
                )}
            >
                {/* decorative icon, so empty alt*/}
                <Image src={imgSrc} alt="" />
            </div>

            <div className="flex flex-1 flex-col items-start gap-2 self-stretch md:gap-3">
                <Heading size="h2">{title}</Heading>
                <p className="text-base leading-normal font-normal text-neutral-500">{subtitle}</p>
            </div>
            <Button
                variant={isPrimary ? 'primary' : 'secondary'}
                iconRight={isPrimary ? undefined : IconType.LINK_EXTERNAL}
                size="md"
                href={actionHref}
                onClick={actionOnClick}
                target={isPrimary ? '_self' : '_blank'}
                className="self-stretch md:self-start"
            >
                {actionLabel}
            </Button>
        </div>
    );
};
