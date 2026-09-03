import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as walletAccountApi from '@/modules/application/hooks/useWalletAccount';
import type { IUseEnsNameReturn } from '@/modules/ens';
import * as ensModule from '@/modules/ens';
import { Network } from '@/shared/api/daoService';
import { SafeMultisigVoteList } from './safeMultisigVoteList';
import type { ISafeMultisigVoteListProps } from './safeMultisigVoteList.api';

describe('<SafeMultisigVoteList /> component', () => {
    const viewer = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const otherOwner = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

    const useWalletAccountSpy = jest.spyOn(
        walletAccountApi,
        'useWalletAccount',
    );
    const useEnsNameSpy = jest.spyOn(ensModule, 'useEnsName');
    const useEnsAvatarSpy = jest.spyOn(ensModule, 'useEnsAvatar');

    const unresolved = {
        data: null,
        isLoading: false,
    } as unknown as IUseEnsNameReturn;

    beforeEach(() => {
        useWalletAccountSpy.mockReturnValue({
            address: viewer,
            chainId: 1,
            isConnecting: false,
            isReconnecting: false,
        });
        useEnsNameSpy.mockReturnValue(unresolved);
        useEnsAvatarSpy.mockReturnValue(
            unresolved as unknown as ReturnType<typeof ensModule.useEnsAvatar>,
        );
    });

    afterEach(() => {
        useWalletAccountSpy.mockReset();
        useEnsNameSpy.mockReset();
        useEnsAvatarSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<ISafeMultisigVoteListProps>,
    ) => {
        const completeProps: ISafeMultisigVoteListProps = {
            network: Network.ETHEREUM_MAINNET,
            signers: [otherOwner, viewer],
            isVeto: false,
            isLoading: false,
            isError: false,
            ...props,
        };

        return (
            <GukModulesProvider>
                <SafeMultisigVoteList {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('lists the connected owner first so a viewer sees their own signature', () => {
        render(createTestComponent());

        const rendered = screen
            .getAllByRole('link')
            .map((link) => link.getAttribute('href') ?? '');

        expect(rendered).toHaveLength(2);
        expect(rendered[0]).toContain(viewer);
        expect(rendered[1]).toContain(otherOwner);
    });

    it('states no signatures rather than an empty list when nothing is collected', () => {
        render(createTestComponent({ signers: [] }));

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigVoteList.empty.heading',
            ),
        ).toBeInTheDocument();
    });

    it('separates an unreadable Safe from a body nobody has signed', () => {
        render(createTestComponent({ signers: [], isError: true }));

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigVoteList.error.heading',
            ),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(
                'app.plugins.safeMultisig.safeMultisigVoteList.empty.heading',
            ),
        ).not.toBeInTheDocument();
    });
});
