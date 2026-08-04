import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as useWalletAccountHook from '@/modules/application/hooks/useWalletAccount';
import * as ensModule from '@/modules/ens';
import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import type { IVoteDialogParams } from '@/modules/governance/dialogs/voteDialog';
import * as useUserVoteHook from '@/modules/governance/hooks/useUserVote';
import { generateTokenProposal } from '@/plugins/tokenPlugin/testUtils';
import type { ITokenVote } from '@/plugins/tokenPlugin/types';
import { VoteOption } from '@/plugins/tokenPlugin/types';
import * as dialogProvider from '@/shared/components/dialogProvider';
import * as useDaoChainHook from '@/shared/hooks/useDaoChain';
import * as useDaoPluginsHook from '@/shared/hooks/useDaoPlugins';
import {
    generateDaoPlugin,
    generateDialogContext,
    generateFilterComponentPlugin,
} from '@/shared/testUtils';
import * as useAlchemixOverrideStatusHook from '../../hooks/useAlchemixOverrideStatus/useAlchemixOverrideStatus';
import type { IAlchemixVoteOption } from '../../utils/alchemixTransactionUtils';
import {
    AlchemixSubmitVote,
    type IAlchemixSubmitVoteProps,
} from './alchemixSubmitVote';

jest.mock('@/plugins/tokenPlugin/components/tokenSubmitVote', () => ({
    ...jest.requireActual('@/plugins/tokenPlugin/components/tokenSubmitVote'),
    TokenSubmitVoteDefault: () => (
        <div data-testid="token-submit-vote-default" />
    ),
}));

jest.mock('./components', () => ({
    AlchemixObjectionVote: () => <div data-testid="alchemix-objection-vote" />,
}));

describe('<AlchemixSubmitVote /> component', () => {
    const useWalletAccountSpy = jest.spyOn(
        useWalletAccountHook,
        'useWalletAccount',
    );
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useDaoPluginsSpy = jest.spyOn(useDaoPluginsHook, 'useDaoPlugins');
    const useDaoChainSpy = jest.spyOn(useDaoChainHook, 'useDaoChain');
    const useUserVoteSpy = jest.spyOn(useUserVoteHook, 'useUserVote');
    const useEnsNameSpy = jest.spyOn(ensModule, 'useEnsName');
    const useEnsAvatarSpy = jest.spyOn(ensModule, 'useEnsAvatar');
    const useAlchemixOverrideStatusSpy = jest.spyOn(
        useAlchemixOverrideStatusHook,
        'useAlchemixOverrideStatus',
    );

    const userAddress = '0x1111111111111111111111111111111111111111';
    const delegatee = '0x2222222222222222222222222222222222222222';

    const buildOverrideStatus = (
        status?: Partial<
            ReturnType<
                typeof useAlchemixOverrideStatusHook.useAlchemixOverrideStatus
            >
        >,
    ) => ({
        isEligible: true,
        delegatee: delegatee as `0x${string}`,
        delegatedVotingPower: BigInt('500000000000000000000'),
        userVoteRecord: undefined,
        delegateeVoteRecord: undefined,
        canOverride: true,
        canOverrideErrReason: undefined,
        canVote: false,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
        ...status,
    });

    beforeEach(() => {
        useWalletAccountSpy.mockReturnValue({
            address: userAddress,
        } as unknown as ReturnType<
            typeof useWalletAccountHook.useWalletAccount
        >);
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        useDaoPluginsSpy.mockReturnValue([
            generateFilterComponentPlugin({ meta: generateDaoPlugin() }),
        ]);
        useDaoChainSpy.mockReturnValue({
            buildEntityUrl: ({ id }: { id?: string }) =>
                id != null ? `https://explorer.test/tx/${id}` : undefined,
        } as unknown as ReturnType<typeof useDaoChainHook.useDaoChain>);
        useUserVoteSpy.mockReturnValue(undefined);
        useEnsNameSpy.mockReturnValue({
            data: null,
            isLoading: false,
        } as ReturnType<typeof ensModule.useEnsName>);
        useEnsAvatarSpy.mockReturnValue({
            data: null,
            isLoading: false,
        } as ReturnType<typeof ensModule.useEnsAvatar>);
        useAlchemixOverrideStatusSpy.mockReturnValue(buildOverrideStatus());
    });

    afterEach(() => {
        useWalletAccountSpy.mockReset();
        useDialogContextSpy.mockReset();
        useDaoPluginsSpy.mockReset();
        useDaoChainSpy.mockReset();
        useUserVoteSpy.mockReset();
        useEnsNameSpy.mockReset();
        useEnsAvatarSpy.mockReset();
        useAlchemixOverrideStatusSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IAlchemixSubmitVoteProps>) => {
        const completeProps: IAlchemixSubmitVoteProps = {
            daoId: 'test-dao-id',
            proposal: generateTokenProposal(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <AlchemixSubmitVote {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the default voting controls when the user is not eligible for overrides', () => {
        useAlchemixOverrideStatusSpy.mockReturnValue(
            buildOverrideStatus({ isEligible: false }),
        );
        render(createTestComponent());
        expect(
            screen.getByTestId('token-submit-vote-default'),
        ).toBeInTheDocument();
    });

    it('renders the objection controls instead of the default ones on an objection stage', () => {
        const proposal = generateTokenProposal();
        proposal.settings.isObjection = true;
        useAlchemixOverrideStatusSpy.mockReturnValue(
            buildOverrideStatus({ isEligible: false }),
        );
        render(createTestComponent({ proposal }));

        expect(
            screen.getByTestId('alchemix-objection-vote'),
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('token-submit-vote-default'),
        ).not.toBeInTheDocument();
        expect(useAlchemixOverrideStatusSpy).toHaveBeenCalledWith(
            expect.objectContaining({ enabled: false }),
        );
    });

    it('renders the default voting controls when no wallet is connected', () => {
        useWalletAccountSpy.mockReturnValue({
            address: undefined,
        } as unknown as ReturnType<
            typeof useWalletAccountHook.useWalletAccount
        >);
        render(createTestComponent());
        expect(
            screen.getByTestId('token-submit-vote-default'),
        ).toBeInTheDocument();
    });

    it('renders the default voting controls when the override status cannot be fetched', () => {
        useAlchemixOverrideStatusSpy.mockReturnValue(
            buildOverrideStatus({ isError: true }),
        );
        render(createTestComponent());
        expect(
            screen.getByTestId('token-submit-vote-default'),
        ).toBeInTheDocument();
    });

    it('renders nothing while the override status is loading', () => {
        useAlchemixOverrideStatusSpy.mockReturnValue(
            buildOverrideStatus({ isLoading: true, isEligible: false }),
        );
        const { container } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the delegate info and a secondary override button when the delegate has not voted', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/alchemixSubmitVote.delegateTag/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/alchemixSubmitVote.delegateNotVoted/),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: /alchemixSubmitVote.buttons.override/,
            }),
        ).toBeEnabled();
    });

    it('renders the vote option of the delegate when they voted', () => {
        useAlchemixOverrideStatusSpy.mockReturnValue(
            buildOverrideStatus({
                delegateeVoteRecord: {
                    voteOption: VoteOption.YES,
                    votingPower: BigInt(100),
                    reduction: BigInt(0),
                    hasOverridden: false,
                    votedWithDelegatedVp: true,
                },
            }),
        );

        render(createTestComponent());

        expect(
            screen.getByText(/alchemixSubmitVote.delegateVoted/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/tokenSubmitVote.options.yes/),
        ).toBeInTheDocument();
    });

    it('opens the vote dialog with the vote-and-override type by default when the user can also vote', async () => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));
        useAlchemixOverrideStatusSpy.mockReturnValue(
            buildOverrideStatus({ canVote: true }),
        );

        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: /alchemixSubmitVote.buttons.override/,
            }),
        );

        expect(screen.getByRole('switch')).toBeChecked();

        await userEvent.click(
            screen.getByRole('radio', {
                name: /tokenSubmitVote.options.yes/,
            }),
        );
        await userEvent.click(
            screen.getByRole('button', {
                name: /tokenSubmitVote.buttons.submit/,
            }),
        );

        expect(open).toHaveBeenCalledWith(
            GovernanceDialogId.VOTE,
            expect.objectContaining({
                params: expect.objectContaining({
                    vote: expect.objectContaining({
                        voteType: 'voteAndOverride',
                    }),
                }),
            }),
        );
    });

    it('opens the vote dialog with the override type when the user turns off the also-vote switch', async () => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));
        useAlchemixOverrideStatusSpy.mockReturnValue(
            buildOverrideStatus({ canVote: true }),
        );

        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: /alchemixSubmitVote.buttons.override/,
            }),
        );
        await userEvent.click(screen.getByRole('switch'));
        await userEvent.click(
            screen.getByRole('radio', {
                name: /tokenSubmitVote.options.yes/,
            }),
        );
        await userEvent.click(
            screen.getByRole('button', {
                name: /tokenSubmitVote.buttons.submit/,
            }),
        );

        expect(open).toHaveBeenCalledWith(
            GovernanceDialogId.VOTE,
            expect.objectContaining({
                params: expect.objectContaining({
                    vote: expect.objectContaining({ voteType: 'override' }),
                }),
            }),
        );
    });

    it('disables the submit button until a vote option is selected and after it is deselected', async () => {
        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: /alchemixSubmitVote.buttons.override/,
            }),
        );

        const submitButton = screen.getByRole('button', {
            name: /tokenSubmitVote.buttons.submit/,
        });
        expect(submitButton).toBeDisabled();

        const yesOption = screen.getByRole('radio', {
            name: /tokenSubmitVote.options.yes/,
        });
        await userEvent.click(yesOption);
        expect(submitButton).toBeEnabled();

        // Clicking the selected option again deselects it, the submit button must be disabled again instead of
        // submitting an invalid vote option.
        await userEvent.click(yesOption);
        expect(submitButton).toBeDisabled();
    });

    it('renders the user position and a change button when the user has overridden', () => {
        useAlchemixOverrideStatusSpy.mockReturnValue(
            buildOverrideStatus({
                userVoteRecord: {
                    voteOption: VoteOption.NO,
                    votingPower: BigInt(100),
                    reduction: BigInt(0),
                    hasOverridden: true,
                    votedWithDelegatedVp: false,
                },
            }),
        );

        render(createTestComponent());

        expect(
            screen.getByText(/alchemixSubmitVote.position.overrode/),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: /tokenSubmitVote.buttons.submitted/,
            }),
        ).toBeDisabled();
        expect(
            screen.getByRole('button', {
                name: /tokenSubmitVote.buttons.change.vote/,
            }),
        ).toBeEnabled();
    });

    it('links the vote-submitted button to the transaction once the vote is indexed', () => {
        useUserVoteSpy.mockReturnValue({
            transactionHash: '0x123',
            voteOption: VoteOption.NO,
        } as unknown as ITokenVote);
        useAlchemixOverrideStatusSpy.mockReturnValue(
            buildOverrideStatus({
                userVoteRecord: {
                    voteOption: VoteOption.NO,
                    votingPower: BigInt(100),
                    reduction: BigInt(0),
                    hasOverridden: true,
                    votedWithDelegatedVp: false,
                },
            }),
        );

        render(createTestComponent());

        expect(
            screen.getByRole('link', {
                name: /tokenSubmitVote.buttons.submitted/,
            }),
        ).toHaveAttribute('href', 'https://explorer.test/tx/0x123');
    });

    it('renders the user position when the user has voted without overriding', () => {
        useAlchemixOverrideStatusSpy.mockReturnValue(
            buildOverrideStatus({
                userVoteRecord: {
                    voteOption: VoteOption.YES,
                    votingPower: BigInt(100),
                    reduction: BigInt(0),
                    hasOverridden: false,
                    votedWithDelegatedVp: true,
                },
            }),
        );

        render(createTestComponent());

        expect(
            screen.getByText(/alchemixSubmitVote.position.voted/),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(/alchemixSubmitVote.position.overrode/),
        ).not.toBeInTheDocument();
    });

    it('disables the current vote option of the user when changing the position', async () => {
        useAlchemixOverrideStatusSpy.mockReturnValue(
            buildOverrideStatus({
                userVoteRecord: {
                    voteOption: VoteOption.NO,
                    votingPower: BigInt(100),
                    reduction: BigInt(0),
                    hasOverridden: true,
                    votedWithDelegatedVp: false,
                },
            }),
        );

        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: /tokenSubmitVote.buttons.change.vote/,
            }),
        );

        expect(
            screen.getByRole('radio', {
                name: /tokenSubmitVote.options.no/,
            }),
        ).toBeDisabled();
    });

    it('does not display the delegate as voting with the user tokens when their vote has been fully overridden', () => {
        useAlchemixOverrideStatusSpy.mockReturnValue(
            buildOverrideStatus({
                userVoteRecord: {
                    voteOption: VoteOption.NO,
                    votingPower: BigInt(100),
                    reduction: BigInt(0),
                    hasOverridden: true,
                    votedWithDelegatedVp: false,
                },
            }),
        );

        render(createTestComponent());

        expect(
            screen.getByText(/alchemixSubmitVote.delegateOverridden/),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(/alchemixSubmitVote.delegateNotVoted/),
        ).not.toBeInTheDocument();
    });

    it('displays the delegate as having voted without the user tokens on a partial override', () => {
        useAlchemixOverrideStatusSpy.mockReturnValue(
            buildOverrideStatus({
                userVoteRecord: {
                    voteOption: VoteOption.NO,
                    votingPower: BigInt(100),
                    reduction: BigInt(0),
                    hasOverridden: true,
                    votedWithDelegatedVp: false,
                },
                delegateeVoteRecord: {
                    voteOption: VoteOption.YES,
                    votingPower: BigInt(100),
                    reduction: BigInt(100),
                    hasOverridden: false,
                    votedWithDelegatedVp: true,
                },
            }),
        );

        render(createTestComponent());

        expect(
            screen.getByText(/alchemixSubmitVote.delegateVotedOverridden/),
        ).toBeInTheDocument();
    });

    it('refetches the on-chain status and closes the options when the vote transaction is confirmed', async () => {
        const open = jest.fn();
        const refetch = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));
        useAlchemixOverrideStatusSpy.mockReturnValue(
            buildOverrideStatus({ refetch }),
        );

        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: /alchemixSubmitVote.buttons.override/,
            }),
        );
        await userEvent.click(
            screen.getByRole('radio', { name: /tokenSubmitVote.options.yes/ }),
        );
        await userEvent.click(
            screen.getByRole('button', {
                name: /tokenSubmitVote.buttons.submit/,
            }),
        );

        const { params } = open.mock.calls[0][1] as {
            params: IVoteDialogParams;
        };
        act(() => params.onSuccess?.());

        expect(refetch).toHaveBeenCalled();
        expect(
            screen.queryByRole('radio', {
                name: /tokenSubmitVote.options.yes/,
            }),
        ).not.toBeInTheDocument();
    });

    it('disables the override button when the user can neither override nor vote', () => {
        useAlchemixOverrideStatusSpy.mockReturnValue(
            buildOverrideStatus({ canOverride: false, canVote: false }),
        );

        render(createTestComponent());

        expect(
            screen.getByRole('button', {
                name: /alchemixSubmitVote.buttons.override/,
            }),
        ).toBeDisabled();
    });

    it('opens the vote dialog with a plain vote and no also-vote switch when the user can vote but not override', async () => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));
        useAlchemixOverrideStatusSpy.mockReturnValue(
            buildOverrideStatus({ canOverride: false, canVote: true }),
        );

        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: /tokenSubmitVote.buttons.vote/,
            }),
        );

        expect(screen.queryByRole('switch')).not.toBeInTheDocument();

        await userEvent.click(
            screen.getByRole('radio', {
                name: /tokenSubmitVote.options.yes/,
            }),
        );
        await userEvent.click(
            screen.getByRole('button', {
                name: /tokenSubmitVote.buttons.submit/,
            }),
        );

        const { params } = open.mock.calls[0][1] as {
            params: IVoteDialogParams;
        };
        expect(open).toHaveBeenCalledWith(
            GovernanceDialogId.VOTE,
            expect.anything(),
        );
        expect(params.vote.value).toEqual(VoteOption.YES);
        expect((params.vote as IAlchemixVoteOption).voteType).toBeUndefined();
    });

    it('allows changing an existing position with a plain vote for any option when the user cannot override', async () => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));
        useAlchemixOverrideStatusSpy.mockReturnValue(
            buildOverrideStatus({
                canOverride: false,
                canVote: true,
                userVoteRecord: {
                    voteOption: VoteOption.NO,
                    votingPower: BigInt(100),
                    reduction: BigInt(0),
                    hasOverridden: false,
                    votedWithDelegatedVp: true,
                },
                delegateeVoteRecord: {
                    voteOption: VoteOption.YES,
                    votingPower: BigInt(100),
                    reduction: BigInt(0),
                    hasOverridden: false,
                    votedWithDelegatedVp: true,
                },
            }),
        );

        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: /tokenSubmitVote.buttons.change.vote/,
            }),
        );

        // A plain vote casts the user's own voting power, the option the delegate voted on must stay enabled.
        const yesOption = screen.getByRole('radio', {
            name: /tokenSubmitVote.options.yes/,
        });
        expect(yesOption).toBeEnabled();
        expect(
            screen.getByRole('radio', { name: /tokenSubmitVote.options.no/ }),
        ).toBeDisabled();

        await userEvent.click(yesOption);

        const submitButton = screen.getByRole('button', {
            name: /tokenSubmitVote.buttons.change.submit/,
        });
        expect(submitButton).toBeEnabled();
        await userEvent.click(submitButton);

        const { params } = open.mock.calls[0][1] as {
            params: IVoteDialogParams;
        };
        expect(params.vote.value).toEqual(VoteOption.YES);
        expect((params.vote as IAlchemixVoteOption).voteType).toBeUndefined();
    });
});
