'use client';

import classNames from 'classnames';
import Image from 'next/image';
import type { ComponentProps } from 'react';
import { useAccount, useEnsName } from 'wagmi';
import { twkEverett } from '@/daos/xmaquina/assets/fonts/twkEverett';
import { Carousel } from '@/shared/components/carousel';
import { Container } from '@/shared/components/container';
import { useTranslations } from '@/shared/components/translationsProvider';
import BackgroundImage from '../../assets/xmaquina_bg.jpg';
import DroidImage from '../../assets/xmaquina_droid.webp';
import { actions } from '../../constants/actions';
import { XmaquinaActionItem } from './xmaquinaActionItem';

export interface IXmaquinaPageHeaderProps extends ComponentProps<'header'> {}

export const XmaquinaPageHeader: React.FC<IXmaquinaPageHeaderProps> = (props) => {
    const { className, ...otherProps } = props;
    const { address } = useAccount();
    const { data: ensName } = useEnsName({
        address,
        chainId: 1,
    });

    const { t } = useTranslations();

    return (
        <header
            className={classNames('relative flex flex-col justify-between overflow-hidden md:h-114', twkEverett.className, className)}
            {...otherProps}
        >
            <Image alt="" className="absolute inset-0 -z-30 object-cover" fill={true} priority={true} src={BackgroundImage} />

            <Container className="relative flex w-full grow flex-col">
                <div className="top-6 flex w-fit max-w-180 flex-col gap-1.5 pt-6 pb-6 md:absolute md:top-8 md:w-180 md:gap-3">
                    <p className="text-3xl text-neutral-0 leading-tight md:text-5xl">
                        {t('app.daos.xmaquina.xmaquinaPageHeader.welcome')} {ensName && <span className="text-[#1ED612]">{ensName}</span>}
                        <br />
                        {t('app.daos.xmaquina.xmaquinaPageHeader.to')}
                    </p>
                    <p className="text-base text-neutral-300 md:text-2xl">{t('app.daos.xmaquina.xmaquinaPageHeader.info')}</p>
                </div>
                <Image
                    alt="XMAQUINA Robot"
                    className="absolute right-[8%] bottom-0 -z-20 hidden lg:block"
                    height={421}
                    priority={true}
                    src={DroidImage}
                    style={{
                        objectFit: 'contain',
                        objectPosition: 'top right',
                    }}
                    width={435}
                />

                {/* Static row for desktop view */}
                <div className="hidden h-full grow border-l border-l-neutral-0/10 lg:flex">
                    {actions.map((action) => (
                        <XmaquinaActionItem key={action.title} {...action} />
                    ))}
                </div>
            </Container>
            <div className="hidden md:block lg:hidden">
                <div className="absolute top-0 left-4 h-[400%] w-px -translate-y-1/2 bg-white/10" />
                <div className="absolute top-0 left-[calc(33.33%)] h-[400%] w-px -translate-y-1/2 bg-white/10" />
                <div className="absolute top-0 right-[calc(33.33%)] h-[400%] w-px -translate-y-1/2 bg-white/10" />
                <div className="absolute top-0 right-4 h-[400%] w-px -translate-y-1/2 bg-white/10" />
                <Carousel animationDelay={2} gap={1} speed={40} speedOnHoverFactor={0.2}>
                    {actions.map((action) => (
                        <XmaquinaActionItem key={action.title} {...action} />
                    ))}
                </Carousel>
            </div>
            <div className="block md:hidden">
                <div className="absolute top-0 left-4 h-[400%] w-px -translate-y-1/2 bg-white/10" />
                <div className="absolute top-0 left-[calc(33.33%)] h-[400%] w-px -translate-y-1/2 bg-white/10" />
                <div className="absolute top-0 right-[calc(33.33%)] h-[400%] w-px -translate-y-1/2 bg-white/10" />
                <div className="absolute top-0 right-4 h-[400%] w-px -translate-y-1/2 bg-white/10" />
                <Carousel animationDelay={2} gap={1} isDraggable={true} speed={40} speedOnHoverFactor={0.2}>
                    {actions.map((action) => (
                        <XmaquinaActionItem key={action.title} {...action} />
                    ))}
                </Carousel>
            </div>
        </header>
    );
};
