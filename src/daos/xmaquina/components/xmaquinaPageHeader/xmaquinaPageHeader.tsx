'use client';

import { twkEverett } from '@/daos/xmaquina/assets/fonts/twkEverett';
import type { IDao } from '@/shared/api/daoService';
import { Carousel } from '@/shared/components/carousel';
import { Container } from '@/shared/components/container';
import { useTranslations } from '@/shared/components/translationsProvider';
import classNames from 'classnames';
import Image from 'next/image';
import type { ComponentProps } from 'react';
import { useAccount, useEnsName } from 'wagmi';
import BackgroundImage from '../../assets/xmaquina_bg.jpg';
import DroidImage from '../../assets/xmaquina_droid.webp';
import { actions } from '../../constants/actions';
import { XmaquinaActionItem } from './xmaquinaActionItem';

export interface IXmaquinaPageHeaderProps extends ComponentProps<'header'> {
    /**
     * DAO to display in the header.
     */
    dao: IDao;
}

export const XmaquinaPageHeader: React.FC<IXmaquinaPageHeaderProps> = (props) => {
    const { dao, className, ...otherProps } = props;
    const { address } = useAccount();
    const { data: ensName } = useEnsName({
        address: address,
        chainId: 1,
    });

    const { t } = useTranslations();

    return (
        <header
            className={classNames(
                'relative flex flex-col justify-between overflow-hidden md:h-114',
                twkEverett.className,
                className,
            )}
            {...otherProps}
        >
            <Image
                src={BackgroundImage}
                alt=""
                fill={true}
                className="absolute inset-0 -z-30 object-cover"
                priority={true}
            />

            <Container className="relative flex w-full grow flex-col">
                <div className="top-6 flex w-fit max-w-180 flex-col gap-1.5 pt-6 pb-6 md:absolute md:top-8 md:w-180 md:gap-3">
                    <p className="text-neutral-0 text-3xl leading-tight md:text-5xl">
                        {t('app.daos.xmaquina.xmaquinaPageHeader.welcome')}{' '}
                        {ensName && <span className="text-[#1ED612]">{ensName}</span>}
                        <br />
                        {t('app.daos.xmaquina.xmaquinaPageHeader.to')}
                    </p>
                    <p className="text-base text-neutral-300 md:text-2xl">
                        {t('app.daos.xmaquina.xmaquinaPageHeader.info')}
                    </p>
                </div>
                <Image
                    src={DroidImage}
                    alt="XMAQUINA Robot"
                    width={435}
                    height={421}
                    className="absolute right-[8%] bottom-0 -z-20 hidden lg:block"
                    priority={true}
                    style={{ objectFit: 'contain', objectPosition: 'top right' }}
                />

                {/* Static row for desktop view */}
                <div className="border-l-neutral-0/10 hidden h-full grow border-l lg:flex">
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
                <Carousel speed={40} speedOnHoverFactor={0.2} animationDelay={2} gap={1}>
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
                <Carousel speed={40} speedOnHoverFactor={0.2} animationDelay={2} gap={1} isDraggable={true}>
                    {actions.map((action) => (
                        <XmaquinaActionItem key={action.title} {...action} />
                    ))}
                </Carousel>
            </div>
        </header>
    );
};
