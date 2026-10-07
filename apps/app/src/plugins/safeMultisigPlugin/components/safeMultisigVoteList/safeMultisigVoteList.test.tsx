import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as walletAccountApi from '@/modules/application/hooks/useWalletAccount';
import type { IUseEnsNameReturn } from '@/modules/ens';
import * as ensModule from '@/modules/ens';
import {
    generateSppProposal,
    generateSppStage,
} from '@/plugins/sppPlugin/testUtils';
import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import * as useDaoPluginsApi from '@/shared/hooks/useDaoPlugins';
import {
    generateDaoPlugin,
    generateFilterComponentPlugin,
} from '@/shared/testUtils';
import * as safeBodyStateApi from '../../hooks/useSafeMultisigBodyState';
import { generateSafeBodyState, generateSafeInfo } from '../../testUtils';
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
    const useSafeBodyStateSpy = jest.spyOn(
        safeBodyStateApi,
        'useSafeMultisigBodyState',
    );
    const useDaoPluginsSpy = jest.spyOn(useDaoPluginsApi, 'useDaoPlugins');

    const bodyState = generateSafeBodyState({
        safeInfo: generateSafeInfo({ owners: [viewer, otherOwner] }),
        isLoading: false,
        isError: false,
        signers: [otherOwner, viewer],
        hasConnectedWalletSigned: true,
        approvalsAmount: 2,
        minApprovals: 2,
        membersCount: 2,
        isRateLimited: false,
        isStale: false,
    });

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
        useSafeBodyStateSpy.mockReturnValue(bodyState);
        useEnsNameSpy.mockReturnValue(unresolved);
        useEnsAvatarSpy.mockReturnValue(
            unresolved as unknown as ReturnType<typeof ensModule.useEnsAvatar>,
        );
        useDaoPluginsSpy.mockImplementation(({ pluginAddress }) => [
            generateFilterComponentPlugin({
                id: PluginInterfaceType.SAFE,
                uniqueId: `${pluginAddress ?? ''}-safe`,
                meta: generateDaoPlugin({
                    address: pluginAddress,
                    interfaceType: PluginInterfaceType.SAFE,
                    isBody: true,
                    slug: 'safe',
                }),
            }),
        ]);
    });

    afterEach(() => {
        useWalletAccountSpy.mockReset();
        useEnsNameSpy.mockReset();
        useEnsAvatarSpy.mockReset();
        useSafeBodyStateSpy.mockReset();
        useDaoPluginsSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<ISafeMultisigVoteListProps>,
    ) => {
        const completeProps: ISafeMultisigVoteListProps = {
            proposal: generateSppProposal({
                network: Network.ETHEREUM_MAINNET,
                proposalIndex: '42',
            }),
            body: '0x0000000000000000000000000000000000000001',
            stage: generateSppStage({ stageIndex: 1 }),
            isVeto: false,
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

    it('links a Safe signer to their DAO member profile', () => {
        const daoAddress = '0x1111111111111111111111111111111111111111';
        const body = '0x2222222222222222222222222222222222222222';

        render(
            createTestComponent({
                proposal: generateSppProposal({
                    network: Network.ETHEREUM_MAINNET,
                    daoAddress,
                }),
                body,
            }),
        );

        expect(screen.getAllByRole('link')[0]).toHaveAttribute(
            'href',
            `/dao/ethereum-mainnet/${daoAddress}/members/${viewer}?members=${body}-safe`,
        );
    });

    // The members tab is addressed by the Safe's canonical body record. Without one there is no
    // tab to open, so a link would lead to whichever body happened to sort first.
    it('renders signers without a profile link when the DAO carries no Safe body', () => {
        useDaoPluginsSpy.mockReturnValue([]);

        render(createTestComponent());

        expect(screen.queryAllByRole('link')).toHaveLength(0);
        expect(screen.getByText(/0xaaaa/i)).toBeInTheDocument();
    });

    it('states no signatures rather than an empty list when a successful read is empty', () => {
        useSafeBodyStateSpy.mockReturnValue({ ...bodyState, signers: [] });

        render(createTestComponent());

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigVoteList.empty.heading',
            ),
        ).toBeInTheDocument();
    });

    it('keeps the list loading when Safe info is unavailable', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...bodyState,
            safeInfo: undefined,
            signers: [],
            isError: true,
            isLoading: false,
        });

        render(createTestComponent());

        expect(
            screen.queryByText(
                'app.plugins.safeMultisig.safeMultisigVoteList.empty.heading',
            ),
        ).not.toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('keeps cached confirmations visible when the Safe read later errors', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...bodyState,
            signers: [otherOwner],
            isError: true,
            isLoading: false,
        });

        render(createTestComponent());

        expect(screen.getAllByRole('link')).toHaveLength(1);
    });
});
