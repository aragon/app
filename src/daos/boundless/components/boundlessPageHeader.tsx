import type { IDao } from '@/shared/api/daoService';
import { Carousel } from '@/shared/components/carousel';
import { Container } from '@/shared/components/container';
import classNames from 'classnames';
import type { ComponentProps } from 'react';
import { useAccount, useEnsName } from 'wagmi';
import BoundlessVideo from '../assets/boundless-header-video.mp4';
import { actions } from '../constants/actions';
import { BoundlessActionItem } from './boundlessActionItem';

export interface IBoundlessPageHeaderProps extends ComponentProps<'header'> {
    /**
     * DAO to display in the header.
     */
    dao: IDao;
}

export const BoundlessPageHeader: React.FC<IBoundlessPageHeaderProps> = (props) => {
    const { dao, className, ...otherProps } = props;
    const { address } = useAccount();
    const { data: ensName } = useEnsName({
        address: address,
        chainId: 1,
    });

    return (
        <header
            className={classNames(
                'relative flex h-fit flex-col gap-y-4 pb-4 pt-6 md:gap-y-12 md:pb-10 md:pt-16',
                className,
            )}
            {...otherProps}
        >
            <video className="absolute inset-0 -z-30 h-full w-full object-cover" autoPlay loop muted playsInline>
                <source src={BoundlessVideo} type="video/mp4" />
            </video>
            <Container className="flex w-full flex-col gap-y-12">
                <div className="flex max-w-[720px] flex-col gap-3 text-center md:text-left">
                    <p className="text-3xl text-[#000000] md:text-5xl">
                        Welcome {ensName && <span className="text-[#537263]">{ensName}</span>}
                        <br />
                        to Boundless DAO
                    </p>
                    <p className="text-lg text-[#2D2C2B] md:text-xl">
                        Boundless DAO is a community-led organization advancing the Boundless vision: bringing ZK to
                        every blockchain, developer, and everyone in between.
                    </p>
                </div>

                <div className="hidden w-full items-center justify-between gap-4 lg:flex">
                    {actions.map((action) => (
                        <BoundlessActionItem
                            key={action.title}
                            title={action.title}
                            description={action.description}
                            image={action.image}
                            href={action.href}
                        />
                    ))}
                </div>
            </Container>
            <div className="block lg:hidden">
                <Carousel speed={40} speedOnHoverFactor={0} animationDelay={2} gap={16}>
                    {actions.map((action) => (
                        <BoundlessActionItem
                            key={action.title}
                            title={action.title}
                            description={action.description}
                            image={action.image}
                            href={action.href}
                        />
                    ))}
                </Carousel>
            </div>
        </header>
    );
};
