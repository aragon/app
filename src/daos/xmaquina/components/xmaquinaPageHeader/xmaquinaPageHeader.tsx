'use client';

import type { IDao } from '@/shared/api/daoService';
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
                'relative flex h-fit flex-col justify-between overflow-hidden pt-6 pb-0 md:pt-16 md:pb-0',
                className,
            )}
            style={{ fontFamily: 'TWK Everett, sans-serif' }}
            {...otherProps}
        >
            <Image
                src={BackgroundImage}
                alt=""
                fill={true}
                className="absolute inset-0 -z-30 object-cover"
                priority={true}
            />

            <Container className="relative flex w-full flex-col">
                <Image
                    src={DroidImage}
                    alt="XMAQUINA Robot"
                    width={435}
                    height={421}
                    className="absolute right-[8%] bottom-0 -z-20 hidden md:block"
                    priority={true}
                    style={{ objectFit: 'contain', objectPosition: 'top right' }}
                />
                <div className="mb-12 flex max-w-[720px] flex-col gap-1.5 text-center md:mb-16 md:gap-3 md:text-left">
                    <p className="text-3xl leading-tight text-white md:text-5xl">
                        {t('app.daos.xmaquina.xmaquinaPageHeader.welcome')}{' '}
                        {ensName && <span className="text-[#00FF00]">{ensName}</span>}
                        <br />
                        {t('app.daos.xmaquina.xmaquinaPageHeader.to')}
                    </p>
                    <p className="text-lg text-neutral-300 md:text-xl">
                        {t('app.daos.xmaquina.xmaquinaPageHeader.info')}
                    </p>
                </div>
                <div className="relative flex w-full flex-col gap-px md:flex-row md:items-stretch">
                    {/* Left edge divider */}
                    <div className="absolute top-0 left-0 hidden h-[400%] w-px -translate-y-1/2 bg-white/10 md:block" />

                    {actions.map((action, index) => (
                        <>
                            <XmaquinaActionItem
                                key={action.title}
                                title={action.title}
                                description={action.description}
                                icon={action.icon}
                                href={action.href}
                                isExternal={action.isExternal}
                            />
                            {/* Divider between items */}
                            {index < actions.length - 1 && (
                                <div
                                    className="absolute hidden h-[400%] w-px -translate-y-1/2 bg-white/10 md:block"
                                    style={{ left: `${((index + 1) / 3) * 100}%` }}
                                />
                            )}
                        </>
                    ))}

                    {/* Right edge divider */}
                    <div className="absolute top-0 right-0 hidden h-[400%] w-px -translate-y-1/2 bg-white/10 md:block" />
                </div>
            </Container>
        </header>
    );
};
