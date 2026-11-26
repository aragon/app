import type * as GovUiKit from '@aragon/gov-ui-kit';
import { AddressResolutionProvider, addressEntryKey } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import {
    type INavigationSidebarAccountProps,
    NavigationSidebarAccount,
} from './navigationSidebarAccount';

jest.mock('@aragon/gov-ui-kit', () => ({
    ...jest.requireActual<typeof GovUiKit>('@aragon/gov-ui-kit'),
    MemberAvatar: () => <div data-testid="member-avatar-mock" />,
}));

describe('<NavigationSidebarAccount /> component', () => {
    const address = '0x251D7a1B2a0Fd2E6C2b6A6dC6fBf3c1E8a2E96B8';

    const createTestComponent = (
        props?: Partial<INavigationSidebarAccountProps>,
    ) => {
        const completeProps: INavigationSidebarAccountProps = {
            onClick: jest.fn(),
            ...props,
        };

        return <NavigationSidebarAccount {...completeProps} />;
    };

    it('renders a connect button that opens the wallet flow while disconnected', async () => {
        const onClick = jest.fn();
        render(createTestComponent({ onClick }));

        await userEvent.click(
            screen.getByRole('button', {
                name: /navigationSidebarAccount.connect/,
            }),
        );
        expect(onClick).toHaveBeenCalled();
        expect(
            screen.queryByTestId('member-avatar-mock'),
        ).not.toBeInTheDocument();
    });

    it('shows the name with the truncated address below once connected', async () => {
        const onClick = jest.fn();
        render(
            createTestComponent({ onClick, user: { address, name: 'whomst' } }),
        );

        expect(screen.getByText('whomst')).toBeInTheDocument();
        expect(screen.getByText('0x251D…96B8')).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalled();
    });

    it('falls back to the truncated address alone when the user has no name', () => {
        render(createTestComponent({ user: { address } }));

        expect(screen.getAllByText('0x251D…96B8')).toHaveLength(1);
    });

    describe('with an address book', () => {
        // The same address named twice, as an account of the workspace and by ENS.
        const renderWithBook = (user: INavigationSidebarAccountProps['user']) =>
            render(
                <AddressResolutionProvider
                    entries={
                        new Map([
                            [
                                addressEntryKey(address, 0),
                                {
                                    label: 'Ops Safe',
                                    source: 'known-account' as const,
                                },
                            ],
                        ])
                    }
                    resolve={() =>
                        Promise.resolve({ label: 'whomst.eth', source: 'ens' })
                    }
                >
                    {createTestComponent({ user })}
                </AddressResolutionProvider>,
            );

        it('shows a profile name once, with the plain short address below', () => {
            renderWithBook({ address, name: 'whomst' });

            expect(screen.getAllByText('whomst')).toHaveLength(1);
            expect(screen.getByText('0x251D…96B8')).toBeInTheDocument();
            expect(screen.queryByText('Ops Safe')).not.toBeInTheDocument();
        });

        it('shows an unnamed user once, by the address book name', () => {
            renderWithBook({ address });

            expect(screen.getAllByText('Ops Safe')).toHaveLength(1);
            expect(screen.queryByText('0x251D…96B8')).not.toBeInTheDocument();
        });
    });
});
