'use client';

import { useDao } from '@/shared/api/daoService';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { Button, DaoAvatar, IconType } from '@aragon/ods';
import classNames from 'classnames';
import { useState } from 'react';
import { Navigation, type INavigationContainerProps } from '../navigation';
import { navigationDaoLinks } from './navigationDaoLinks';

export interface INavigationDaoProps extends INavigationContainerProps {
    /**
     * DAO slug to display the data for.
     */
    slug: string;
}

export const NavigationDao: React.FC<INavigationDaoProps> = (props) => {
    const { slug, containerClasses, ...otherProps } = props;

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const urlParams = { slug };
    const { data: dao } = useDao({ urlParams });

    const daoAvatar = ipfsUtils.cidToSrc(dao?.avatar);
    const links = navigationDaoLinks(dao?.permalink);

    return (
        <Navigation.Container
            containerClasses={classNames('flex flex-col gap-2 py-3 md:pb-0 md:pt-5 lg:gap-3', containerClasses)}
            {...otherProps}
        >
            <div className="flex flex-row justify-between">
                <button className="flex flex-row items-center gap-3 p-1">
                    <DaoAvatar src={daoAvatar} name={dao?.name} size="md" />
                    <p className="text-base font-normal leading-tight text-neutral-800">{dao?.name}</p>
                </button>
                <Navigation.Trigger className="md:hidden" onClick={() => setIsDialogOpen(true)} />
            </div>
            <Navigation.Links className="hidden md:flex lg:pl-[56px]" links={links} variant="columns" />
            <Navigation.Dialog links={links} open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <div className="flex flex-col gap-4 px-4">
                    <div className="flex grow flex-row justify-between">
                        <DaoAvatar src={daoAvatar} name={dao?.name} size="md" />
                        <div className="flex flex-row gap-3">
                            <Button
                                variant="tertiary"
                                size="sm"
                                responsiveSize={{ sm: 'md' }}
                                iconLeft={IconType.COPY}
                            />
                            <Button
                                variant="tertiary"
                                size="sm"
                                responsiveSize={{ sm: 'md' }}
                                iconLeft={IconType.APP_EXPLORE}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5 font-normal leading-tight">
                        <p className="text-lg text-neutral-800 sm:text-xl">{dao?.name}</p>
                        <p className="text-sm text-neutral-500 sm:text-base">{dao?.ens ?? dao?.daoAddress}</p>
                    </div>
                </div>
            </Navigation.Dialog>
        </Navigation.Container>
    );
};
