'use client';

import classNames from 'classnames';
import type { ComponentProps } from 'react';
import { useAccount, useEnsName } from 'wagmi';
import type { IDao } from '@/shared/api/daoService';
import { Carousel } from '@/shared/components/carousel';
import { Container } from '@/shared/components/container';
import { useTranslations } from '@/shared/components/translationsProvider';
import { actions } from '../../constants/actions';
import { BoundlessActionItem } from './boundlessActionItem';

export interface IBoundlessPageHeaderProps extends ComponentProps<'header'> {
    /**
     * DAO to display in the header.
     */
    dao: IDao;
}

export const BoundlessPageHeader: React.FC<IBoundlessPageHeaderProps> = (
    props,
) => {
    const { dao, className, ...otherProps } = props;
    const { address } = useAccount();
    const { data: ensName } = useEnsName({
        address,
        chainId: 1,
    });

    const { t } = useTranslations();

    return (
        <header
            className={classNames(
                'relative flex h-fit flex-col gap-y-4 pt-6 pb-4 md:gap-y-12 md:pt-16 md:pb-10',
                className,
            )}
            {...otherProps}
        >
            <video
                autoPlay={true}
                className="absolute inset-0 -z-30 size-full object-cover"
                loop={true}
                muted={true}
                playsInline={true}
            >
                <source
                    src="/static/media/boundless-header-video.mp4"
                    type="video/mp4"
                />
            </video>
            <Container className="flex w-full flex-col gap-y-12">
                <div className="flex max-w-[720px] flex-col gap-1.5 text-center md:gap-3 md:text-left">
                    <p className="text-3xl text-[#000000] leading-tight md:text-5xl">
                        {t('app.daos.boundless.boundlessPageHeader.welcome')}{' '}
                        {ensName && (
                            <span className="text-[#537263]">{ensName}</span>
                        )}
                        <br />
                        {t('app.daos.boundless.boundlessPageHeader.to')}
                    </p>
                    <p className="text-[#2D2C2B] text-lg md:text-xl">
                        {t('app.daos.boundless.boundlessPageHeader.info')}
                    </p>
                </div>
                {/* Static row for desktop view */}
                <div className="hidden w-full items-center justify-between gap-4 lg:flex">
                    {actions.map((action) => (
                        <BoundlessActionItem
                            description={action.description}
                            href={action.href}
                            image={action.image}
                            isExternal={action.isExternal}
                            key={action.title}
                            title={action.title}
                        />
                    ))}
                </div>
            </Container>
            {/* Draggable unbounded carousel for mobile view */}
            <div className="hidden md:block lg:hidden">
                <Carousel
                    animationDelay={2}
                    gap={16}
                    speed={40}
                    speedOnHoverFactor={0.2}
                >
                    {actions.map((action) => (
                        <BoundlessActionItem
                            description={action.description}
                            href={action.href}
                            image={action.image}
                            key={action.title}
                            title={action.title}
                        />
                    ))}
                </Carousel>
            </div>
            <div className="block md:hidden">
                <Carousel
                    animationDelay={2}
                    gap={16}
                    isDraggable={true}
                    speed={40}
                    speedOnHoverFactor={0.2}
                >
                    {actions.map((action) => (
                        <BoundlessActionItem
                            description={action.description}
                            href={action.href}
                            image={action.image}
                            key={action.title}
                            title={action.title}
                        />
                    ))}
                </Carousel>
            </div>
        </header>
    );
};
