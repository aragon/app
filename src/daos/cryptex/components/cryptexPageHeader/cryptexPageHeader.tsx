'use client';

import classNames from 'classnames';
import type { ComponentProps } from 'react';
import { useConnection, useEnsName } from 'wagmi';
import { Carousel } from '@/shared/components/carousel';
import { Container } from '@/shared/components/container';
import { useTranslations } from '@/shared/components/translationsProvider';
import { actions } from '../../constants/actions';
import { CryptexActionItem } from './cryptexActionItem';
import { CryptexOrbitAnimation, ORBIT_SIZE } from './cryptexOrbitAnimation';

export interface ICryptexPageHeaderProps extends ComponentProps<'header'> {}

export const CryptexPageHeader: React.FC<ICryptexPageHeaderProps> = (props) => {
    const { className, ...otherProps } = props;
    const { address } = useConnection();
    const { data: ensName } = useEnsName({
        address,
        chainId: 1,
    });

    const { t } = useTranslations();

    // Center the orbit 120px above the bottom edge so ~73% of the circle is visible.
    // right: calc(20% - half) keeps the orbit center fixed at 80% from the left
    // regardless of ORBIT_SIZE, with the right edge clipping naturally.
    const orbitHalf = ORBIT_SIZE / 2;

    return (
        <header
            className={classNames(
                'relative flex h-fit min-h-[400px] flex-col gap-y-4 overflow-hidden bg-[#0A0A0F] pt-6 pb-4 md:min-h-[480px] md:gap-y-12 md:pt-16 md:pb-10',
                className,
            )}
            {...otherProps}
        >
            {/* Background texture — blurred blobs + noise grain over dark base */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {/* Left bloom — upper left behind welcome text */}
                <div className="absolute -top-20 -left-20 h-[480px] w-[480px] rounded-full bg-purple-500/20 blur-[120px]" />
                {/* Center bloom — behind middle card area */}
                <div className="absolute bottom-0 left-[38%] h-[280px] w-[360px] -translate-x-1/2 rounded-full bg-purple-500/15 blur-[100px]" />
                {/* Noise grain layer */}
                <svg
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full opacity-[0.035]"
                    focusable="false"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <filter id="cryptex-grain">
                        <feTurbulence
                            baseFrequency="0.65"
                            numOctaves="3"
                            stitchTiles="stitch"
                            type="fractalNoise"
                        />
                    </filter>
                    <rect
                        filter="url(#cryptex-grain)"
                        height="100%"
                        width="100%"
                    />
                </svg>
            </div>

            {/*
             * Orbit — center sits 290px above the header's bottom edge (~40% from
             * top on a 480px header), placing the crown near the header top-right.
             * overflow-hidden clips the bottom portion and any right bleed.
             */}
            <div
                className="pointer-events-none absolute hidden md:block"
                style={{
                    bottom: `${-(orbitHalf - 370)}px`,
                    right: `calc(25% - ${orbitHalf}px)`,
                    transform: 'translateY(-1%) scale(1.02)',
                    transformOrigin: 'center',
                }}
            >
                <div className="md:translate-x-20 lg:translate-x-24 xl:translate-x-0">
                    <CryptexOrbitAnimation />
                </div>
            </div>

            <Container className="relative z-10 flex w-full flex-col gap-y-12">
                <div className="relative flex max-w-[520px] flex-col gap-1.5 text-left md:gap-3 xl:max-w-[600px]">
                    <div className="pointer-events-none absolute -inset-x-10 -inset-y-8 -z-10 hidden bg-gradient-to-l from-black/70 via-black/26 to-transparent blur-2xl md:block" />
                    <p className="text-3xl text-white leading-tight md:text-5xl">
                        {t('app.daos.cryptex.cryptexPageHeader.welcome')}{' '}
                        {ensName && (
                            <span className="text-purple-400">{ensName}</span>
                        )}
                        <br />
                        {t('app.daos.cryptex.cryptexPageHeader.to')}
                    </p>
                    <p className="text-lg text-white/60 md:text-xl">
                        {t('app.daos.cryptex.cryptexPageHeader.info')}
                    </p>
                </div>

                {/* Static row for extra-large desktop view */}
                <div className="hidden w-full items-center justify-between gap-4 xl:flex">
                    {actions.map((action) => (
                        <CryptexActionItem
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

            {/* Tablet and large-screen carousel */}
            <div className="relative z-10 hidden md:block xl:hidden">
                <Carousel
                    animationDelay={2}
                    gap={16}
                    speed={40}
                    speedOnHoverFactor={0.2}
                >
                    {actions.map((action) => (
                        <CryptexActionItem
                            description={action.description}
                            href={action.href}
                            image={action.image}
                            key={action.title}
                            title={action.title}
                        />
                    ))}
                </Carousel>
            </div>

            {/* Mobile draggable carousel */}
            <div className="relative z-10 block md:hidden">
                <Carousel
                    animationDelay={2}
                    gap={16}
                    isDraggable={true}
                    speed={40}
                    speedOnHoverFactor={0.2}
                >
                    {actions.map((action) => (
                        <CryptexActionItem
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
