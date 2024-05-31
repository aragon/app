'use client';

import { useDao } from '@/shared/api/daoService';
import { AvatarIcon, DaoAvatar, IconType } from '@aragon/ods';
import classNames from 'classnames';
import { NavigationLinks } from '../../navigationLinks';
import { NavigationBase, type INavigationBaseProps } from '../navigationBase';
import { navigationDaoLinks } from './navigationDaoLinks';

export interface INavigationDaoProps extends INavigationBaseProps {
    /**
     * DAO slug to display the data for.
     */
    slug: string;
}

export const NavigationDao: React.FC<INavigationDaoProps> = (props) => {
    const { slug, containerClasses, ...otherProps } = props;

    const urlParams = { slug };
    const { data: dao } = useDao({ urlParams });

    const links = navigationDaoLinks(slug); // TODO: use dao?.permalink

    const menuTriggerClasses = [
        'rounded-full border border-neutral-100 bg-neutral-0 p-[3px] outline-none md:hidden', // Default
        'hover:border-neutral-200 active:border-neutral-200 active:bg-neutral-50', // Hover / Active states
        'focus:outline-none focus-visible:ring focus-visible:ring-primary focus-visible:ring-offset', // Focus state
    ].join('');

    return (
        <NavigationBase
            containerClasses={classNames('flex flex-col gap-2 py-3 md:pb-0 md:pt-5 lg:gap-3', containerClasses)}
            {...otherProps}
        >
            <div className="flex flex-row justify-between">
                <button className="flex flex-row items-center gap-3 p-1">
                    <DaoAvatar src={dao?.avatar ?? undefined} size="md" />
                    <p className="text-base leading-tight text-neutral-800">{dao?.name}</p>
                </button>
                <div className="flex flex-row gap-2">
                    <button className={menuTriggerClasses}>
                        <AvatarIcon icon={IconType.MENU} size="lg" />
                    </button>
                </div>
            </div>
            <NavigationLinks className="hidden md:flex lg:pl-[56px]" links={links} variant="columns" />
        </NavigationBase>
    );
};
