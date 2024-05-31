'use client';

import { useDao } from '@/shared/api/daoService';
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

    const links = navigationDaoLinks(slug); // TODO: use dao?.permalink

    return (
        <Navigation.Container
            containerClasses={classNames('flex flex-col gap-2 py-3 md:pb-0 md:pt-5 lg:gap-3', containerClasses)}
            {...otherProps}
        >
            <div className="flex flex-row justify-between">
                <button className="flex flex-row items-center gap-3 p-1">
                    <DaoAvatar src={dao?.avatar ?? undefined} name={dao?.name} size="md" />
                    <p className="text-base leading-tight text-neutral-800">{dao?.name}</p>
                </button>
                <div className="flex flex-row gap-2">
                    {/* TODO: render wallet component */}
                    <Navigation.Trigger onClick={() => setIsDialogOpen(true)} />
                </div>
            </div>
            <Navigation.Links className="hidden md:flex lg:pl-[56px]" links={links} variant="columns" />
            <Navigation.Dialog links={links} open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <div className="flex flex-col gap-4 px-4">
                    <div className="flex grow flex-row justify-between">
                        <DaoAvatar src={dao?.avatar ?? undefined} name={dao?.name} size="md" />
                        <div className="flex flex-row gap-3">
                            <Button variant="tertiary" size="md" iconLeft={IconType.COPY} />
                            <Button variant="tertiary" size="md" iconLeft={IconType.APP_EXPLORE} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5 font-normal leading-tight">
                        <p className="text-xl text-neutral-800">{dao?.name}</p>
                        <p className="text-base text-neutral-500">{dao?.ens ?? dao?.daoAddress}</p>
                    </div>
                </div>
            </Navigation.Dialog>
        </Navigation.Container>
    );
};
