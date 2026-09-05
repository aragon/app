import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as walletAccountApi from '@/modules/application/hooks/useWalletAccount';
import type { IUseEnsNameReturn } from '@/modules/ens';
import * as ensModule from '@/modules/ens';
import {
    generateSppProposal,
    generateSppStage,
} from '@/plugins/sppPlugin/testUtils';
import { Network } from '@/shared/api/daoService';
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
    });

    afterEach(() => {
        useWalletAccountSpy.mockReset();
        useEnsNameSpy.mockReset();
        useEnsAvatarSpy.mockReset();
        useSafeBodyStateSpy.mockReset();
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

    it('states no signatures rather than an empty list when nothing is collected', () => {
        useSafeBodyStateSpy.mockReturnValue({ ...bodyState, signers: [] });

        render(createTestComponent());

        expect(
            screen.getByText(
                'app.plugins.safeMultisig.safeMultisigVoteList.empty.heading',
            ),
        ).toBeInTheDocument();
    });

    it('separates an unreadable Safe from a body nobody has signed', () => {
        useSafeBodyStateSpy.mockReturnValue({
            ...bodyState,
            signers: [],
            isError: true,
        });

        render(createTestComponent());

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
