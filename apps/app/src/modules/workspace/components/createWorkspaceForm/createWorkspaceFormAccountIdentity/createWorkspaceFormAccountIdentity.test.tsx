import {
    AddressResolutionProvider,
    addressEntryKey,
    addressUtils,
    GukModulesProvider,
} from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    type IWorkspaceAccountInfo,
    WorkspaceAccountInfoStatus,
    WorkspaceAccountInfoType,
} from '../../../api/workspaceQueryService';
import {
    CreateWorkspaceFormAccountIdentity,
    type ICreateWorkspaceFormAccountIdentityProps,
} from './createWorkspaceFormAccountIdentity';

describe('<CreateWorkspaceFormAccountIdentity /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';

    const buildAccountInfo = (
        accountInfo?: Partial<IWorkspaceAccountInfo>,
    ): IWorkspaceAccountInfo => ({
        network: Network.ETHEREUM_SEPOLIA,
        address,
        type: WorkspaceAccountInfoType.DAO,
        status: WorkspaceAccountInfoStatus.AVAILABLE,
        indexed: true,
        ...accountInfo,
    });

    const createTestComponent = (
        props?: Partial<ICreateWorkspaceFormAccountIdentityProps>,
    ) => {
        const completeProps: ICreateWorkspaceFormAccountIdentityProps = {
            ...props,
        };

        return (
            <GukModulesProvider>
                <CreateWorkspaceFormAccountIdentity {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('displays the loading state while the lookup is in flight', () => {
        render(createTestComponent({ isLoading: true }));

        expect(
            screen.getByText(/accounts.identity.resolving/),
        ).toBeInTheDocument();
    });

    it('displays the DAO name and tag for a resolved DAO', () => {
        const accountInfo = buildAccountInfo({ name: 'Demo DAO' });

        render(createTestComponent({ accountInfo }));

        expect(screen.getByText('Demo DAO')).toBeInTheDocument();
        expect(
            screen.getByText(/accounts.identity.type.dao/),
        ).toBeInTheDocument();
    });

    it('falls back to the truncated address for a DAO without a name', () => {
        const accountInfo = buildAccountInfo({ name: null });

        render(createTestComponent({ accountInfo }));

        expect(
            screen.getByText(addressUtils.truncateAddress(address)),
        ).toBeInTheDocument();
    });

    describe('with an address book', () => {
        // The same address named by the address book on the account's network.
        const renderWithBook = (accountInfo: IWorkspaceAccountInfo) =>
            render(
                <AddressResolutionProvider
                    entries={
                        new Map([
                            [
                                addressEntryKey(
                                    address,
                                    networkDefinitions[Network.ETHEREUM_SEPOLIA]
                                        .id,
                                ),
                                {
                                    label: 'Ops Safe',
                                    source: 'known-account' as const,
                                },
                            ],
                        ])
                    }
                >
                    {createTestComponent({ accountInfo })}
                </AddressResolutionProvider>,
            );

        it('names an unnamed account by the address book, once', () => {
            renderWithBook(buildAccountInfo({ name: null }));

            expect(screen.getAllByText('Ops Safe')).toHaveLength(1);
            expect(
                screen.queryByText(addressUtils.truncateAddress(address)),
            ).not.toBeInTheDocument();
        });

        it('shows a named DAO once, with the plain short address below', () => {
            renderWithBook(buildAccountInfo({ name: 'Demo DAO' }));

            expect(screen.getByText('Demo DAO')).toBeInTheDocument();
            expect(
                screen.getByText(addressUtils.truncateAddress(address)),
            ).toBeInTheDocument();
            expect(screen.queryByText('Ops Safe')).not.toBeInTheDocument();
        });
    });

    it('displays the address and tag for a resolved Safe, which the API never names', () => {
        const accountInfo = buildAccountInfo({
            type: WorkspaceAccountInfoType.SAFE,
            indexed: false,
        });

        render(createTestComponent({ accountInfo }));

        expect(
            screen.getByText(addressUtils.truncateAddress(address)),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/accounts.identity.type.safe/),
        ).toBeInTheDocument();
    });

    it.each([
        WorkspaceAccountInfoStatus.UNSUPPORTED,
        WorkspaceAccountInfoStatus.UNAVAILABLE,
    ])(
        'renders nothing for a %s account, the field validation states the reason',
        (status) => {
            const accountInfo = buildAccountInfo({
                status,
                type: WorkspaceAccountInfoType.UNKNOWN,
            });

            const { container } = render(createTestComponent({ accountInfo }));

            expect(container).toBeEmptyDOMElement();
        },
    );

    it('renders nothing before the lookup resolves', () => {
        const { container } = render(createTestComponent());

        expect(container).toBeEmptyDOMElement();
    });
});
