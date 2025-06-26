import { IconType } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import type { Route } from 'next';
import * as NextNavigation from 'next/navigation';
import { NavigationLinks, type INavigationLinksProps } from './navigationLinks';

describe('<Navigation.Links /> component', () => {
    const usePathnameSpy = jest.spyOn(NextNavigation, 'usePathname');

    beforeEach(() => {
        usePathnameSpy.mockReturnValue('');
    });

    const createTestComponent = (props?: Partial<INavigationLinksProps>) => {
        const completeProps: INavigationLinksProps = {
            links: [],
            ...props,
        };

        return <NavigationLinks {...completeProps} />;
    };

    it('renders the specified links', () => {
        const links = [
            { label: 'first-link', link: '/firstLink' as Route, icon: IconType.APP_ASSETS },
            { label: 'second-link', link: '/secondLink' as Route, icon: IconType.APP_DASHBOARD },
        ];
        render(createTestComponent({ links }));
        expect(screen.getByRole('link', { name: links[0].label })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: links[1].label })).toBeInTheDocument();
    });

    it('does not render the links marked as hidden', () => {
        const links = [
            { label: 'hidden-link', link: '/hidden' as Route, icon: IconType.APP_ASSETS, hidden: true },
            { label: 'visible-link', link: '/visible' as Route, icon: IconType.APP_MEMBERS, hidden: false },
        ];
        render(createTestComponent({ links }));
        expect(screen.queryByRole('link', { name: links[0].label })).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: links[1].label })).toBeInTheDocument();
    });
});
