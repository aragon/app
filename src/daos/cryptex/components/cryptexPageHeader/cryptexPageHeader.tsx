'use client';

import classNames from 'classnames';
import { type ComponentProps, useState } from 'react';
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
    const [isLightMode, setIsLightMode] = useState(false);
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
                'relative isolate z-0 flex h-fit min-h-[400px] flex-col gap-y-4 overflow-hidden border-b pt-6 pb-4 transition-colors duration-500 md:min-h-[480px] md:gap-y-12 md:pt-16 md:pb-10',
                isLightMode
                    ? 'border-[#E5E6EC] bg-[#F3F4F7]'
                    : 'border-[#1D1B28] bg-[#0A0A0F]',
                className,
            )}
            {...otherProps}
        >
            {/* Background texture */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                    className={classNames(
                        'absolute inset-0 bg-gradient-to-r from-white/82 via-white/50 to-[#EEE9FF]/26 transition-opacity duration-700',
                        isLightMode ? 'opacity-100' : 'opacity-0',
                    )}
                />
                {/* Left bloom — upper left behind welcome text */}
                <div
                    className={classNames(
                        'absolute rounded-full blur-[130px] transition-all duration-700',
                        isLightMode
                            ? '-top-20 -left-24 h-[520px] w-[520px] bg-[#B493FF]/30'
                            : '-top-20 -left-20 h-[480px] w-[480px] bg-purple-500/20',
                    )}
                />
                {/* Center-bottom bloom — soft edge distinction near cards */}
                <div
                    className={classNames(
                        'absolute left-[48%] -translate-x-1/2 rounded-full transition-all duration-700',
                        isLightMode
                            ? '-bottom-16 h-[280px] w-[440px] bg-[#C7B0FF]/30 blur-[115px]'
                            : '-bottom-42 h-[190px] w-[720px] bg-purple-500/14 blur-[120px]',
                    )}
                />
                {/* Noise grain layer */}
                <svg
                    aria-hidden="true"
                    className={classNames(
                        'absolute inset-0 h-full w-full transition-opacity duration-700',
                        isLightMode ? 'opacity-[0.018]' : 'opacity-[0.035]',
                    )}
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
                className="absolute z-[2] hidden md:block"
                style={{
                    bottom: `${-(orbitHalf - 370)}px`,
                    right: `calc(25% - ${orbitHalf}px)`,
                    transform: 'translateY(-1%) scale(1.02)',
                    transformOrigin: 'center',
                }}
            >
                <div className="pointer-events-auto md:translate-x-20 lg:translate-x-24 xl:translate-x-0">
                    <CryptexOrbitAnimation
                        isLightMode={isLightMode}
                        onToggleMode={() => setIsLightMode((value) => !value)}
                    />
                </div>
            </div>

            <Container className="pointer-events-none relative z-[3] flex w-full flex-col gap-y-12">
                <div className="pointer-events-auto relative flex max-w-[520px] flex-col gap-1.5 text-left md:gap-3 xl:max-w-[600px]">
                    <div
                        className={classNames(
                            'pointer-events-none absolute -inset-x-10 -inset-y-8 -z-10 hidden blur-2xl transition-all duration-700 md:block',
                            isLightMode
                                ? 'bg-gradient-to-l from-white/70 via-white/26 to-transparent'
                                : 'bg-gradient-to-l from-black/70 via-black/26 to-transparent',
                        )}
                    />
                    <p
                        className={classNames(
                            'text-3xl leading-tight transition-colors duration-500 md:text-5xl',
                            isLightMode ? 'text-[#171335]' : 'text-white',
                        )}
                    >
                        {t('app.daos.cryptex.cryptexPageHeader.welcome')}{' '}
                        {ensName && (
                            <span
                                className={
                                    isLightMode
                                        ? 'text-[#5A34CC]'
                                        : 'text-purple-400'
                                }
                            >
                                {ensName}
                            </span>
                        )}
                        <br />
                        {t('app.daos.cryptex.cryptexPageHeader.to')}
                    </p>
                    <p
                        className={classNames(
                            'text-lg transition-colors duration-500 md:text-xl',
                            isLightMode ? 'text-[#252041]/72' : 'text-white/60',
                        )}
                    >
                        {t('app.daos.cryptex.cryptexPageHeader.info')}
                    </p>
                </div>

                {/* Static row for extra-large desktop view */}
                <div className="pointer-events-auto relative z-[3] hidden w-full items-center justify-between gap-4 xl:flex">
                    {actions.map((action) => (
                        <CryptexActionItem
                            description={action.description}
                            href={action.href}
                            image={action.image}
                            isExternal={action.isExternal}
                            isLightMode={isLightMode}
                            key={action.title}
                            title={action.title}
                        />
                    ))}
                </div>
            </Container>

            {/* Tablet and large-screen carousel */}
            <div className="pointer-events-auto relative z-[3] hidden md:block xl:hidden">
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
                            isLightMode={isLightMode}
                            key={action.title}
                            title={action.title}
                        />
                    ))}
                </Carousel>
            </div>

            {/* Mobile draggable carousel */}
            <div className="pointer-events-auto relative z-[3] block md:hidden">
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
                            isLightMode={isLightMode}
                            key={action.title}
                            title={action.title}
                        />
                    ))}
                </Carousel>
            </div>
        </header>
    );
};
