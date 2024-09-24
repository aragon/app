import { IconType } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import * as NextNavigation from 'next/navigation';
import { NavigationLinksItem, type INavigationLinksItemProps } from './navigationLinksItem';

// jest.mock('next/navigation', () => ({
//     useRouter: jest.fn(),
// }));

describe('<NavigationLinksItem /> component', () => {
    const usePathnameSpy = jest.spyOn(NextNavigation, 'usePathname');

    beforeEach(() => {
        usePathnameSpy.mockReturnValue('');
    });

    afterEach(() => {
        usePathnameSpy.mockReset();
    });

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

    it('correctly renders the link as row and active when href matches current pathname', () => {
        const href = '/test';
        const variant = 'rows';
        usePathnameSpy.mockReturnValue(href);
        render(createTestComponent({ variant, href }));
        expect(screen.getByRole('link').getAttribute('aria-current')).toEqual('page');
        expect(screen.getByRole('link').className).toContain('bg-neutral-50');
    });

    it('correctly renders the link as column and active when href matches current pathname', () => {
        const href = '/column-test';
        const variant = 'columns';
        usePathnameSpy.mockReturnValue(href);
        render(createTestComponent({ variant, href }));
        expect(screen.getByRole('link').getAttribute('aria-current')).toEqual('page');
        expect(screen.getByRole('link').className).toContain('border-b-2');
    });

    it('renders a link as active when pathname is a subpath of href', () => {
        const href = '/members';
        const pathname = '/members/0x123';
        const variant = 'columns';
        usePathnameSpy.mockReturnValue(pathname);
        render(createTestComponent({ variant, href }));
        expect(screen.getByRole('link').className).toContain('border-b-2');
    });
});
