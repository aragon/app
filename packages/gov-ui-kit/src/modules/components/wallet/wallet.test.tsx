import type { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { mainnet, sepolia } from 'viem/chains';
import * as wagmi from 'wagmi';
import { AddressResolutionProvider, addressEntryKey } from '../../../core';
import { GukModulesProvider } from '../gukModulesProvider';
import { type IWalletProps, Wallet } from './wallet';

jest.mock('../member', () => ({
    MemberAvatar: (props: { chainId: number }) => <div data-chainid={props.chainId} data-testid="member-avatar-mock" />,
}));

jest.mock('../../../core/utils/addressUtils', () => ({
    addressUtils: {
        getChecksum: (address: string) => address,
        isAddress: (address = '') => /^0x[0-9a-fA-F]{40}$/.test(address),
        truncateAddress: (address = '') => `${address.slice(0, 6)}…${address.slice(-4)}`,
        truncateHash: (hash = '') => hash,
    },
}));

describe('<Wallet /> component', () => {
    const useEnsNameMock = jest.spyOn(wagmi, 'useEnsName');

    beforeEach(() => {
        useEnsNameMock.mockReturnValue({ data: null, isLoading: false } as wagmi.UseEnsNameReturnType);
    });

    afterEach(() => {
        useEnsNameMock.mockReset();
    });

    const createTestComponent = (props?: Partial<IWalletProps>, queryClient?: QueryClient) => {
        const completeProps = {
            ...props,
        };

        return (
            <GukModulesProvider queryClient={queryClient}>
                <Wallet {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders connect button when disconnected', () => {
        render(createTestComponent());
        const button = screen.getByRole('button');
        expect(button).toHaveAccessibleName('Connect');
    });

    it('renders member avatar when connected', () => {
        const user = { address: '0x0987654321098765432109876543210987654321' };
        render(createTestComponent({ user }));
        expect(screen.getByTestId('member-avatar-mock')).toBeInTheDocument();
    });

    it('renders the short user address when connected and nothing names it', () => {
        const user = { address: '0x0987654321098765432109876543210987654321' };

        render(createTestComponent({ user }));
        expect(screen.getByText('0x0987…4321')).toBeInTheDocument();
    });

    it('names the user address through the address resolution service, with no lookup of its own', () => {
        const user = { address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' };
        const entries = new Map([[addressEntryKey(user.address, 0), { label: 'vitalik', source: 'ens' as const }]]);

        render(
            <AddressResolutionProvider entries={entries}>{createTestComponent({ user })}</AddressResolutionProvider>,
        );
        expect(screen.getByText('vitalik')).toBeInTheDocument();
        expect(screen.queryByText('0xd8dA…6045')).not.toBeInTheDocument();
        expect(useEnsNameMock).toHaveBeenCalledWith(expect.objectContaining({ query: { enabled: false } }));
    });

    it('looks up the ENS name itself when no address resolution provider is present', () => {
        const user = { address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' };
        useEnsNameMock.mockReturnValue({ data: 'vitalik.eth', isLoading: false } as wagmi.UseEnsNameReturnType);

        render(createTestComponent({ user }));
        expect(useEnsNameMock).toHaveBeenCalledWith(expect.objectContaining({ query: { enabled: true } }));
        expect(screen.getByText('vitalik.eth')).toBeInTheDocument();
        expect(screen.queryByText('0xd8dA…6045')).not.toBeInTheDocument();
    });

    it('renders a loading indicator while it looks up the ENS name itself', () => {
        const user = { address: '0x0987654321098765432109876543210987654321' };
        useEnsNameMock.mockReturnValue({ isLoading: true } as wagmi.UseEnsNameReturnType);

        render(createTestComponent({ user }));
        expect(screen.getByTestId('stateSkeletonBar')).toBeInTheDocument();
    });

    it('renders the user name when one is provided, over the resolved name', () => {
        const user = { address: '0x0987654321098765432109876543210987654321', name: 'vitalik.eth' };
        const entries = new Map([
            [addressEntryKey(user.address, 0), { label: 'Ops wallet', source: 'workspace' as const }],
        ]);

        render(
            <AddressResolutionProvider entries={entries}>{createTestComponent({ user })}</AddressResolutionProvider>,
        );
        expect(screen.getByText('vitalik.eth')).toBeInTheDocument();
        expect(screen.queryByText('Ops wallet')).not.toBeInTheDocument();
        expect(screen.queryByText('0x0987…4321')).not.toBeInTheDocument();
    });

    it('defaults the avatar chain id to ethereum mainnet when not provided', () => {
        const user = { address: '0x0987654321098765432109876543210987654321' };
        render(createTestComponent({ user }));
        expect(screen.getByTestId('member-avatar-mock').dataset.chainid).toEqual(mainnet.id.toString());
    });

    it('supports custom chainId and wagmi configurations', () => {
        const chainId = 137;
        const wagmiConfig = { chains: [sepolia] } as unknown as wagmi.Config;
        const user = { address: '0x0987654321098765432109876543210987654321' };
        render(createTestComponent({ user, chainId, wagmiConfig }));
        const avatar = screen.getByTestId('member-avatar-mock');
        expect(avatar.dataset.chainid).toEqual(chainId.toString());
    });

    it('keeps the connected wallet as a single interactive control', () => {
        const user = { address: '0x0987654321098765432109876543210987654321' };
        render(createTestComponent({ user }));

        expect(screen.getAllByRole('button')).toHaveLength(1);
        expect(screen.queryByRole('button', { name: 'Copy' })).not.toBeInTheDocument();
    });
});
