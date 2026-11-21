import classNames from 'classnames';
import { AvatarIcon } from '../../avatars';
import { Button } from '../../button';
import { IconType } from '../../icon';
import { Card } from '../card';
import type { ICardSummaryProps } from './cardSummary.api';

export const CardSummary: React.FC<ICardSummaryProps> = (props) => {
    const { icon, value, description, action, isStacked = true, className, ...otherProps } = props;

    const containerClassNames = classNames(
        'grid grid-cols-[auto_max-content] items-center px-inset-surface py-inset-surface--16-20',
        { 'gap-group-stepped--16-20': isStacked },
        { 'gap-group-stepped md:grid-flow-col md:grid-cols-[auto_1fr_1fr_max-content]': !isStacked },
    );

    return (
        <Card
            className={classNames({ 'w-80 md:w-120': isStacked }, { 'w-80 md:w-160': !isStacked }, className)}
            {...otherProps}
        >
            <div className={containerClassNames}>
                <AvatarIcon
                    className="self-center"
                    icon={icon}
                    responsiveSize={{ md: 'lg' }}
                    size="md"
                    variant="neutral"
                />
                <Button
                    href={action.href}
                    iconLeft={IconType.PLUS}
                    onClick={action.onClick}
                    responsiveSize={{ md: 'lg' }}
                    size="md"
                    variant="tertiary"
                >
                    {action.label}
                </Button>
                <div
                    className={classNames(
                        'col-span-2 flex gap-x-tight--fixed-8 gap-y-tight',
                        { 'flex-col': isStacked },
                        { 'flex-col md:col-start-2 md:flex-row md:items-baseline': !isStacked },
                    )}
                >
                    <p className="text-2xl leading-tight font-normal text-neutral-800 md:text-3xl">{value}</p>
                    <p className="text-base leading-tight font-normal text-neutral-500">{description}</p>
                </div>
            </div>
        </Card>
    );
};
