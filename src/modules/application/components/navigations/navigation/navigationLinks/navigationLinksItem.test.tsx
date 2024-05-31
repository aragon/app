import { IconType } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { NavigationLinksItem, type INavigationLinksItemProps } from './navigationLinksItem';

describe('<NavigationLinksItem /> component', () => {
    const createTestComponent = (props?: Partial<INavigationLinksItemProps>) => {
        const completeProps: INavigationLinksItemProps = {
            icon: IconType.APP_ASSETS,
            variant: 'columns',
            ...props,
        };

        return <NavigationLinksItem {...completeProps} />;
    };

    it('renders a link with the specified label', () => {
        const children = 'link-label';
        const href = '/test';
        render(createTestComponent({ children, href }));
        expect(screen.getByRole('link', { name: children })).toBeInTheDocument();
    });

    it('renders the specified icon on rows variant', () => {
        const variant = 'rows';
        const icon = IconType.APP_TRANSACTIONS;
        render(createTestComponent({ variant, icon }));
        expect(screen.getByTestId(icon)).toBeInTheDocument();
    });

    it('renders the link as active when href matches current pathname', () => {
        // TODO
    });
});
