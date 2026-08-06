import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as useWalletAccountHook from '@/modules/application/hooks/useWalletAccount';
import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import * as usePermissionCheckGuardHook from '@/modules/governance/hooks/usePermissionCheckGuard';
import * as useUserVoteHook from '@/modules/governance/hooks/useUserVote';
import {
    generateTokenPluginSettings,
    generateTokenProposal,
    generateTokenVote,
} from '@/plugins/tokenPlugin/testUtils';
import { DaoTokenVotingMode, VoteOption } from '@/plugins/tokenPlugin/types';
import * as dialogProvider from '@/shared/components/dialogProvider';
import * as useDaoChainHook from '@/shared/hooks/useDaoChain';
import * as useDaoPluginsHook from '@/shared/hooks/useDaoPlugins';
import {
    generateDaoPlugin,
    generateDialogContext,
    generateFilterComponentPlugin,
} from '@/shared/testUtils';
import {
    type ITokenSubmitVoteDefaultProps,
    TokenSubmitVoteDefault,
} from './tokenSubmitVoteDefault';

describe('<TokenSubmitVoteDefault /> component', () => {
    const useWalletAccountSpy = jest.spyOn(
        useWalletAccountHook,
        'useWalletAccount',
    );
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useDaoPluginsSpy = jest.spyOn(useDaoPluginsHook, 'useDaoPlugins');
    const useDaoChainSpy = jest.spyOn(useDaoChainHook, 'useDaoChain');
    const useUserVoteSpy = jest.spyOn(useUserVoteHook, 'useUserVote');
    const usePermissionCheckGuardSpy = jest.spyOn(
        usePermissionCheckGuardHook,
        'usePermissionCheckGuard',
    );

    beforeEach(() => {
        useWalletAccountSpy.mockReturnValue({
            address: '0x1111111111111111111111111111111111111111',
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
        usePermissionCheckGuardSpy.mockReturnValue({
            check: jest.fn(),
            result: true,
        });
    });

    afterEach(() => {
        useWalletAccountSpy.mockReset();
        useDialogContextSpy.mockReset();
        useDaoPluginsSpy.mockReset();
        useDaoChainSpy.mockReset();
        useUserVoteSpy.mockReset();
        usePermissionCheckGuardSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<ITokenSubmitVoteDefaultProps>,
    ) => {
        const completeProps: ITokenSubmitVoteDefaultProps = {
            daoId: 'test-dao-id',
            proposal: generateTokenProposal(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <TokenSubmitVoteDefault {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('triggers the permission guard when the user without permission clicks the vote button', async () => {
        const check = jest.fn();
        usePermissionCheckGuardSpy.mockReturnValue({ check, result: false });

        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: /tokenSubmitVote.buttons.vote/,
            }),
        );
        expect(check).toHaveBeenCalled();
    });

    it('shows the vote options and opens the vote dialog with the selected option', async () => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));

        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: /tokenSubmitVote.buttons.vote/,
            }),
        );

        const submitButton = screen.getByRole('button', {
            name: /tokenSubmitVote.buttons.submit/,
        });
        expect(submitButton).toBeDisabled();

        await userEvent.click(
            screen.getByRole('radio', { name: /tokenSubmitVote.options.yes/ }),
        );
        await userEvent.click(submitButton);

        expect(open).toHaveBeenCalledWith(
            GovernanceDialogId.VOTE,
            expect.objectContaining({
                params: expect.objectContaining({
                    vote: expect.objectContaining({ value: VoteOption.YES }),
                }),
            }),
        );
    });

    it('links the vote-submitted button to the transaction when the user has voted', () => {
        useUserVoteSpy.mockReturnValue(
            generateTokenVote({
                transactionHash: '0x123',
                voteOption: VoteOption.YES,
            }),
        );

        render(createTestComponent());

        expect(
            screen.getByRole('link', {
                name: /tokenSubmitVote.buttons.submitted/,
            }),
        ).toHaveAttribute('href', 'https://explorer.test/tx/0x123');
        expect(
            screen.queryByRole('button', {
                name: /tokenSubmitVote.buttons.change.vote/,
            }),
        ).not.toBeInTheDocument();
    });

    it('renders the change-vote button on vote replacement and disables submitting the current option', async () => {
        useUserVoteSpy.mockReturnValue(
            generateTokenVote({
                transactionHash: '0x123',
                voteOption: VoteOption.YES,
            }),
        );
        const proposal = generateTokenProposal({
            settings: generateTokenPluginSettings({
                votingMode: DaoTokenVotingMode.VOTE_REPLACEMENT,
            }),
        });

        render(createTestComponent({ proposal }));

        await userEvent.click(
            screen.getByRole('button', {
                name: /tokenSubmitVote.buttons.change.vote/,
            }),
        );

        // The current vote option is preselected and cannot be re-submitted.
        expect(
            screen.getByRole('button', {
                name: /tokenSubmitVote.buttons.change.submit/,
            }),
        ).toBeDisabled();

        await userEvent.click(
            screen.getByRole('radio', { name: /tokenSubmitVote.options.no/ }),
        );
        expect(
            screen.getByRole('button', {
                name: /tokenSubmitVote.buttons.change.submit/,
            }),
        ).toBeEnabled();
    });
});
