import { IconType } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import type { Route } from 'next';
import { NavigationLinks, type INavigationLinksProps } from './navigationLinks';

describe('<Navigation.Links /> component', () => {
    const createTestComponent = (props?: Partial<INavigationLinksProps<string>>) => {
        const completeProps: INavigationLinksProps<string> = {
            links: [],
            ...props,
        };

        return <NavigationLinks {...completeProps} />;
    };
    it('renders the specified links', () => {
        const links = [
            { label: 'first-link', link: '/firstLink' as Route<string>, icon: IconType.APP_ASSETS },
            { label: 'second-link', link: '/secondLink' as Route<string>, icon: IconType.APP_DASHBOARD },
        ];
        render(createTestComponent({ links }));
        expect(screen.getByRole('link', { name: links[0].label })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: links[1].label })).toBeInTheDocument();
    });

    it('renders properly on columns variant', () => {
        const variant = 'columns';
        const { container } = render(createTestComponent({ variant }));
        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        expect(container.querySelector('.flex-row')).toBeInTheDocument();
    });

    it('renders properly on rows variant', () => {
        const variant = 'rows';
        const { container } = render(createTestComponent({ variant }));
        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        expect(container.querySelector('.flex-col')).toBeInTheDocument();
    });
});
