import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as NextNavigation from 'next/navigation';
import {
    type INavigationWorkspaceAccountsProps,
    NavigationWorkspaceAccounts,
} from './navigationWorkspaceAccounts';
import type { IWorkspaceAccountLink } from './navigationWorkspaceUtils';

describe('<NavigationWorkspaceAccounts /> component', () => {
    // The navigation items mark themselves active by comparing the current path.
    const usePathnameSpy = jest.spyOn(NextNavigation, 'usePathname');

    beforeEach(() => {
        usePathnameSpy.mockReturnValue('');
    });

    afterEach(() => {
        usePathnameSpy.mockReset();
    });

    const buildLink = (
        link?: Partial<IWorkspaceAccountLink>,
    ): IWorkspaceAccountLink => ({
        id: 'ethereum-sepolia-0xE8fd',
        label: 'Demo DAO',
        url: '/dao/ethereum-sepolia/0xE8fd',
        ...link,
    });

    const createTestComponent = (
        props?: Partial<INavigationWorkspaceAccountsProps>,
    ) => {
        const completeProps: INavigationWorkspaceAccountsProps = {
            links: [buildLink()],
            ...props,
        };

        return <NavigationWorkspaceAccounts {...completeProps} />;
    };

    it('displays a link per account, separated from the workspace by a rule', () => {
        const { container } = render(createTestComponent());

        expect(screen.getByRole('link', { name: /Demo DAO/ })).toHaveAttribute(
            'href',
            '/dao/ethereum-sepolia/0xE8fd',
        );
        expect(container.querySelector('.border-t')).toBeInTheDocument();
    });

    it('renders the account label verbatim, it is a name and not a translation key', () => {
        const label = 'app.shared.resourcesInput.add';
        render(createTestComponent({ links: [buildLink({ label })] }));

        expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    });

    it('opens every account beside the workspace rather than replacing it', () => {
        render(
            createTestComponent({
                links: [
                    buildLink(),
                    buildLink({
                        id: 'safe',
                        url: 'https://sepolia.etherscan.io/address/0xA941',
                        label: 'Safe',
                    }),
                ],
            }),
        );

        const links = screen.getAllByRole('link');

        expect(links).toHaveLength(2);
        for (const link of links) {
            expect(link).toHaveAttribute('target', '_blank');
        }
    });

    it('notifies the caller on click, so the dialog can close', async () => {
        const onLinkClick = jest.fn();
        render(createTestComponent({ onLinkClick }));

        await userEvent.click(screen.getByRole('link', { name: /Demo DAO/ }));

        expect(onLinkClick).toHaveBeenCalled();
    });

    it('renders nothing when the workspace has no linkable account', () => {
        const { container } = render(createTestComponent({ links: [] }));

        expect(container).toBeEmptyDOMElement();
    });
});
