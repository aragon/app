import { Button, Heading, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import Image from 'next/image';
import type React from 'react';

interface ICtaCardBaseProps {
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
     * Flag to determine if the action points to an external destination.
     */
    isExternal?: boolean;
    /**
     * Custom class name for the component.
     */
    className?: string;
}

interface ICtaCardLinkActionProps {
    /**
     * Path to navigate to when the action button is clicked.
     */
    actionHref: string;
    /**
     * Callback function to execute when the action button is clicked.
     */
    actionOnClick?: never;
}

interface ICtaCardButtonActionProps {
    /**
     * Path to navigate to when the action button is clicked.
     */
    actionHref?: never;
    /**
     * Callback function to execute when the action button is clicked.
     */
    actionOnClick: () => void;
}

export type ICtaCardProps = ICtaCardBaseProps &
    (ICtaCardLinkActionProps | ICtaCardButtonActionProps);

const hasLinkAction = (
    props: ICtaCardProps,
): props is ICtaCardBaseProps & ICtaCardLinkActionProps =>
    typeof props.actionHref === 'string';

/**
 * Might be promoted to a shared component in the future!
 */
export const CtaCard: React.FC<ICtaCardProps> = (props) => {
    const {
        imgSrc,
        title,
        subtitle,
        isPrimary,
        isExternal = false,
        actionLabel,
        className,
    } = props;

    return (
        <div
            className={classNames(
                'flex flex-1 shrink-0 flex-col items-start self-stretch',
                'rounded-xl bg-neutral-0 shadow-neutral',
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
                <Image alt="" src={imgSrc} />
            </div>

            <div className="flex flex-1 flex-col items-start gap-2 self-stretch md:gap-3">
                <Heading size="h2">{title}</Heading>
                <p className="font-normal text-base text-neutral-500 leading-normal">
                    {subtitle}
                </p>
            </div>
            {hasLinkAction(props) ? (
                <Button
                    className="self-stretch md:self-start"
                    href={props.actionHref}
                    iconRight={isExternal ? IconType.LINK_EXTERNAL : undefined}
                    size="md"
                    target={isExternal ? '_blank' : undefined}
                    variant={isPrimary ? 'primary' : 'secondary'}
                >
                    {actionLabel}
                </Button>
            ) : (
                <Button
                    className="self-stretch md:self-start"
                    onClick={props.actionOnClick}
                    size="md"
                    variant={isPrimary ? 'primary' : 'secondary'}
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};
