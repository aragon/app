import { navigationDaoLinks } from '@/modules/application/components/navigations/navigationDao/navigationDaoLinks';
import { generateDao } from '@/shared/testUtils';
import { IconType } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as NextNavigation from 'next/navigation';
import { NavigationLinksItem, type INavigationLinksItemProps } from './navigationLinksItem';

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
            variant: 'row',
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

    it('renders all link icons correctly in column variant', () => {
        const dao = generateDao({ id: 'test' });
        const links = navigationDaoLinks(dao);

        links.forEach((link) => {
            render(
                createTestComponent({
                    children: link.label,
                    href: link.link,
                    icon: link.icon,
                    variant: 'column',
                }),
            );

            expect(screen.getByTestId(link.icon)).toBeInTheDocument();
        });
    });

    it('correctly renders the link as row and active when href matches current pathname', () => {
        const href = '/test';
        const variant = 'column';
        usePathnameSpy.mockReturnValue(href);
        render(createTestComponent({ variant, href }));
        expect(screen.getByRole('link').getAttribute('aria-current')).toEqual('page');
        expect(screen.getByRole('link').className).toContain('bg-neutral-50');
    });

    it('correctly renders the link as active with bg and text in column variant', () => {
        const href = '/test';
        usePathnameSpy.mockReturnValue(href);
        render(createTestComponent({ variant: 'column', href }));

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('aria-current', 'page');
        expect(link.className).toContain('bg-neutral-50');
        expect(link.className).toContain('text-neutral-800');
    });

    it('correctly renders the link as active in row variant (text color only)', () => {
        const href = '/row-test';
        usePathnameSpy.mockReturnValue(href);
        render(createTestComponent({ variant: 'row', href }));

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('aria-current', 'page');
        expect(link.className).toContain('text-neutral-800');
        expect(link.className).not.toContain('bg-neutral-50');
    });

    it('renders a link as active when pathname is a subpath of href', () => {
        const href = '/members';
        const pathname = '/members/0x123';
        usePathnameSpy.mockReturnValue(pathname);
        render(createTestComponent({ variant: 'row', href }));

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('aria-current', 'page');
        expect(link.className).toContain('text-neutral-800');
    });
});
