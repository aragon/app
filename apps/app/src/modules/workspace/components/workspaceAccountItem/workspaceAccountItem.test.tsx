import {
    AddressResolutionProvider,
    addressEntryKey,
    addressUtils,
    GukModulesProvider,
} from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { type IDao, Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    type IWorkspaceAccountInfo,
    WorkspaceAccountInfoStatus,
    WorkspaceAccountInfoType,
} from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { WorkspaceAccountAvatar } from '../workspaceAccountAvatar';
import {
    type IWorkspaceAccountItemProps,
    WorkspaceAccountItem,
} from './workspaceAccountItem';

jest.mock('../workspaceAccountAvatar', () => ({
    WorkspaceAccountAvatar: jest.fn(() => null),
}));

describe('<WorkspaceAccountItem /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';

    const buildAccount = (
        account?: Partial<IWorkspaceAccount>,
    ): IWorkspaceAccount => ({
        id: `ethereum-sepolia-${address}`,
        type: WorkspaceAccountType.DAO,
        address,
        network: Network.ETHEREUM_SEPOLIA,
        ...account,
    });

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
        props?: Partial<IWorkspaceAccountItemProps>,
    ) => {
        const completeProps: IWorkspaceAccountItemProps = {
            account: buildAccount(),
            workspaceId: 'demo',
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceAccountItem {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('displays the network and the address of the account', () => {
        render(createTestComponent());

        expect(
            screen.getByText(networkDefinitions[Network.ETHEREUM_SEPOLIA].name),
        ).toBeInTheDocument();
        expect(
            screen.getByText(addressUtils.truncateAddress(address)),
        ).toBeInTheDocument();
    });

    it.each([
        [WorkspaceAccountType.DAO, 'dao'],
        [WorkspaceAccountType.SAFE, 'safe'],
    ])('displays the %s type stored on the registry', (type, expected) => {
        render(createTestComponent({ account: buildAccount({ type }) }));

        expect(
            screen.getByText(
                new RegExp(`workspaceAccountItem.type.${expected}`),
            ),
        ).toBeInTheDocument();
    });

    it.each([WorkspaceAccountType.DAO, WorkspaceAccountType.SAFE])(
        'links a %s account to its pages inside the workspace',
        (type) => {
            const account = buildAccount({ type });
            render(createTestComponent({ account }));

            expect(screen.getByRole('link')).toHaveAttribute(
                'href',
                `/workspace/demo/${account.id}/overview`,
            );
        },
    );

    it('sets no target on the link, an internal route being followed client-side', () => {
        render(createTestComponent());

        expect(screen.getByRole('link')).not.toHaveAttribute('target');
    });

    it('displays the name resolved by the accounts API', () => {
        render(
            createTestComponent({
                accountInfo: buildAccountInfo({ name: 'Demo DAO' }),
            }),
        );

        expect(screen.getByText('Demo DAO')).toBeInTheDocument();
    });

    it('prefers the account metadata name over the resolved one, it is what the owner called the account', () => {
        render(
            createTestComponent({
                account: buildAccount({ metadata: { name: 'Main treasury' } }),
                accountInfo: buildAccountInfo({ name: 'Demo DAO' }),
            }),
        );

        expect(screen.getByText('Main treasury')).toBeInTheDocument();
        expect(screen.queryByText('Demo DAO')).not.toBeInTheDocument();
    });

    it('shows a named account once, with the plain short address below, when the address book names it too', () => {
        // The workspace names the account (a known account) and ENS names the same address.
        render(
            <AddressResolutionProvider
                entries={
                    new Map([
                        [
                            addressEntryKey(
                                address,
                                networkDefinitions[Network.ETHEREUM_SEPOLIA].id,
                            ),
                            {
                                label: 'Main treasury',
                                source: 'known-account' as const,
                            },
                        ],
                    ])
                }
                resolve={() =>
                    Promise.resolve({ label: 'treasury.eth', source: 'ens' })
                }
            >
                {createTestComponent({
                    account: buildAccount({
                        metadata: { name: 'Main treasury' },
                    }),
                })}
            </AddressResolutionProvider>,
        );

        expect(screen.getAllByText('Main treasury')).toHaveLength(1);
        expect(
            screen.getByText(addressUtils.truncateAddress(address)),
        ).toBeInTheDocument();
        expect(screen.queryByText('treasury.eth')).not.toBeInTheDocument();
    });

    it('displays the name and avatar of the DAO, which the registry does not store', () => {
        const dao = {
            name: 'Indexed DAO',
            avatar: 'ipfs://dao-avatar',
        } as IDao;
        render(createTestComponent({ dao }));

        expect(screen.getByText('Indexed DAO')).toBeInTheDocument();
        expect(WorkspaceAccountAvatar).toHaveBeenLastCalledWith(
            expect.objectContaining({ avatar: 'ipfs://dao-avatar' }),
            undefined,
        );
    });

    it('badges the avatar with the network of the account', () => {
        render(createTestComponent());

        expect(WorkspaceAccountAvatar).toHaveBeenLastCalledWith(
            expect.objectContaining({ network: Network.ETHEREUM_SEPOLIA }),
            undefined,
        );
    });

    describe('with a remove action', () => {
        it('renders a row with a menu instead of a link', () => {
            render(createTestComponent({ onRemove: jest.fn() }));

            expect(screen.queryByRole('link')).not.toBeInTheDocument();
            expect(
                screen.queryByText(/workspaceAccountItem.type/),
            ).not.toBeInTheDocument();
        });

        it('removes the account from its menu', async () => {
            const onRemove = jest.fn();
            render(createTestComponent({ onRemove }));

            await userEvent.click(
                screen.getByRole('button', {
                    name: 'app.workspace.workspaceAccountItem.menu',
                }),
            );
            await userEvent.click(
                await screen.findByRole('menuitem', {
                    name: 'app.workspace.workspaceAccountItem.remove',
                }),
            );

            expect(onRemove).toHaveBeenCalledTimes(1);
        });
    });

    it('shows the full address in a tooltip on its truncated form', async () => {
        render(createTestComponent({ onRemove: jest.fn() }));

        await userEvent.hover(
            screen.getByText(addressUtils.truncateAddress(address)),
        );

        expect(await screen.findByRole('tooltip')).toHaveTextContent(address);
    });

    it('names a DAO without a name by its address', () => {
        render(createTestComponent({ dao: { name: '' } as IDao }));

        // As the title, the address comes before the network line.
        const title = screen.getByText(addressUtils.truncateAddress(address));
        const network = screen.getByText(
            networkDefinitions[Network.ETHEREUM_SEPOLIA].name,
        );
        expect(
            title.compareDocumentPosition(network) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
    });
});
