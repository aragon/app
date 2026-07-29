import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as useWalletAccountHook from '@/modules/application/hooks/useWalletAccount';
import * as ensModule from '@/modules/ens';
import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import * as useUserVoteHook from '@/modules/governance/hooks/useUserVote';
import { generateTokenProposal } from '@/plugins/tokenPlugin/testUtils';
import { VoteOption } from '@/plugins/tokenPlugin/types';
import * as dialogProvider from '@/shared/components/dialogProvider';
import * as useDaoPluginsHook from '@/shared/hooks/useDaoPlugins';
import {
    generateDaoPlugin,
    generateDialogContext,
    generateFilterComponentPlugin,
} from '@/shared/testUtils';
import * as useAlchemixOverrideStatusHook from '../../hooks/useAlchemixOverrideStatus/useAlchemixOverrideStatus';
import {
    AlchemixSubmitVoteOverride,
    type IAlchemixSubmitVoteOverrideProps,
} from './alchemixSubmitVoteOverride';

describe('<AlchemixSubmitVoteOverride /> component', () => {
    const useWalletAccountSpy = jest.spyOn(
        useWalletAccountHook,
        'useWalletAccount',
    );
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useDaoPluginsSpy = jest.spyOn(useDaoPluginsHook, 'useDaoPlugins');
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
        useUserVoteSpy.mockReset();
        useEnsNameSpy.mockReset();
        useEnsAvatarSpy.mockReset();
        useAlchemixOverrideStatusSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IAlchemixSubmitVoteOverrideProps>,
    ) => {
        const completeProps: IAlchemixSubmitVoteOverrideProps = {
            daoId: 'test-dao-id',
            proposal: generateTokenProposal(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <AlchemixSubmitVoteOverride {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders nothing when the user is not eligible for overrides', () => {
        useAlchemixOverrideStatusSpy.mockReturnValue(
            buildOverrideStatus({ isEligible: false }),
        );
        const { container } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when no wallet is connected', () => {
        useWalletAccountSpy.mockReturnValue({
            address: undefined,
        } as unknown as ReturnType<
            typeof useWalletAccountHook.useWalletAccount
        >);
        const { container } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the delegate info and a primary override button when the delegate has not voted', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/alchemixSubmitVoteOverride.delegateTag/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/alchemixSubmitVoteOverride.delegateNotVoted/),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: /alchemixSubmitVoteOverride.buttons.override/,
            }),
        ).toBeInTheDocument();
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
            screen.getByText(/alchemixSubmitVoteOverride.delegateVoted/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/tokenSubmitVote.options.yes/),
        ).toBeInTheDocument();
    });

    it('disables the option the delegate voted on and opens the vote dialog with the override vote type', async () => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));
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

        await userEvent.click(
            screen.getByRole('button', {
                name: /alchemixSubmitVoteOverride.buttons.override/,
            }),
        );

        const yesOption = screen.getByRole('radio', {
            name: /tokenSubmitVote.options.yes/,
        });
        expect(yesOption).toBeDisabled();

        await userEvent.click(
            screen.getByRole('radio', {
                name: /tokenSubmitVote.options.no/,
            }),
        );
        await userEvent.click(
            screen.getByRole('button', {
                name: /alchemixSubmitVoteOverride.buttons.submit/,
            }),
        );

        expect(open).toHaveBeenCalledWith(
            GovernanceDialogId.VOTE,
            expect.objectContaining({
                params: expect.objectContaining({
                    vote: expect.objectContaining({
                        value: VoteOption.NO,
                        voteType: 'override',
                    }),
                }),
            }),
        );
    });

    it('renders the current override and a change button when the user has already overridden', () => {
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
            screen.getByText(/alchemixSubmitVoteOverride.overrideInfo/),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: /alchemixSubmitVoteOverride.buttons.change/,
            }),
        ).toBeInTheDocument();
    });

    it('does not display the delegate as holding the user tokens when their vote has been fully overridden', () => {
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
            screen.getByText(/alchemixSubmitVoteOverride.delegateOverridden/),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(/alchemixSubmitVoteOverride.delegateNotVoted/),
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
            screen.getByText(
                /alchemixSubmitVoteOverride.delegateVotedOverridden/,
            ),
        ).toBeInTheDocument();
    });

    it('submits an atomic vote-and-override when the user can also vote and checks the option', async () => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));
        useAlchemixOverrideStatusSpy.mockReturnValue(
            buildOverrideStatus({ canVote: true }),
        );

        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: /alchemixSubmitVoteOverride.buttons.override/,
            }),
        );
        await userEvent.click(
            screen.getByRole('radio', {
                name: /tokenSubmitVote.options.yes/,
            }),
        );
        await userEvent.click(
            screen.getByText(/alchemixSubmitVoteOverride.alsoVote.label/),
        );
        await userEvent.click(
            screen.getByRole('button', {
                name: /alchemixSubmitVoteOverride.buttons.submit/,
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

    it('disables the override button when the user cannot override', () => {
        useAlchemixOverrideStatusSpy.mockReturnValue(
            buildOverrideStatus({ canOverride: false }),
        );

        render(createTestComponent());

        expect(
            screen.getByRole('button', {
                name: /alchemixSubmitVoteOverride.buttons.override/,
            }),
        ).toBeDisabled();
    });
});
