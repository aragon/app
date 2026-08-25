import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as useWalletAccountHook from '@/modules/application/hooks/useWalletAccount';
import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import type { IVoteDialogParams } from '@/modules/governance/dialogs/voteDialog';
import * as usePermissionCheckGuardHook from '@/modules/governance/hooks/usePermissionCheckGuard';
import { generateTokenProposal } from '@/plugins/tokenPlugin/testUtils';
import { VoteOption } from '@/plugins/tokenPlugin/types';
import * as dialogProvider from '@/shared/components/dialogProvider';
import * as useDaoPluginsHook from '@/shared/hooks/useDaoPlugins';
import {
    generateDaoPlugin,
    generateDialogContext,
    generateFilterComponentPlugin,
} from '@/shared/testUtils';
import * as useAlchemixObjectionStatusHook from '../../../hooks/useAlchemixObjectionStatus/useAlchemixObjectionStatus';
import {
    AlchemixObjectionVote,
    type IAlchemixObjectionVoteProps,
} from './alchemixObjectionVote';

describe('<AlchemixObjectionVote /> component', () => {
    const useWalletAccountSpy = jest.spyOn(
        useWalletAccountHook,
        'useWalletAccount',
    );
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useDaoPluginsSpy = jest.spyOn(useDaoPluginsHook, 'useDaoPlugins');
    const usePermissionCheckGuardSpy = jest.spyOn(
        usePermissionCheckGuardHook,
        'usePermissionCheckGuard',
    );
    const useAlchemixObjectionStatusSpy = jest.spyOn(
        useAlchemixObjectionStatusHook,
        'useAlchemixObjectionStatus',
    );

    const mockObjectionStatus = (values?: {
        voteOption?: VoteOption;
        votingPower?: bigint;
        canObject?: boolean;
        isFetched?: boolean;
    }) => {
        const refetch = jest.fn();
        useAlchemixObjectionStatusSpy.mockReturnValue({
            voteOption: values?.voteOption,
            votingPower: values?.votingPower ?? BigInt(100),
            canObject: values?.canObject ?? true,
            isLoading: false,
            isFetched: values?.isFetched ?? true,
            isError: false,
            refetch,
        });

        return { refetch };
    };

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
        usePermissionCheckGuardSpy.mockReturnValue({
            check: jest.fn(),
            result: true,
        } as ReturnType<
            typeof usePermissionCheckGuardHook.usePermissionCheckGuard
        >);
        mockObjectionStatus();
    });

    afterEach(() => {
        useWalletAccountSpy.mockReset();
        useDialogContextSpy.mockReset();
        useDaoPluginsSpy.mockReset();
        usePermissionCheckGuardSpy.mockReset();
        useAlchemixObjectionStatusSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IAlchemixObjectionVoteProps>,
    ) => {
        const completeProps: IAlchemixObjectionVoteProps = {
            daoId: 'test-dao-id',
            proposal: generateTokenProposal(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <AlchemixObjectionVote {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders a primary vote button when the user has voting power and no recorded option', () => {
        render(createTestComponent());

        const voteButton = screen.getByRole('button', {
            name: /tokenSubmitVote.buttons.vote/,
        });
        expect(voteButton).toHaveClass('bg-primary-400');
    });

    it('renders a secondary vote button that triggers the permission guard when the user cannot object', async () => {
        const check = jest.fn();
        usePermissionCheckGuardSpy.mockReturnValue({
            check,
            result: false,
        } as ReturnType<
            typeof usePermissionCheckGuardHook.usePermissionCheckGuard
        >);
        mockObjectionStatus({ votingPower: BigInt(0), canObject: false });

        render(createTestComponent());

        const voteButton = screen.getByRole('button', {
            name: /tokenSubmitVote.buttons.vote/,
        });
        expect(voteButton).not.toHaveClass('bg-primary-400');
        await userEvent.click(voteButton);
        expect(check).toHaveBeenCalled();
    });

    it.each([VoteOption.YES, VoteOption.ABSTAIN])(
        'renders voted and change-vote controls when the user is recorded with option %s',
        (voteOption) => {
            mockObjectionStatus({ voteOption });
            render(createTestComponent());

            const submittedButton = screen.getByRole('button', {
                name: /tokenSubmitVote.buttons.submitted/,
            });
            expect(submittedButton).toBeDisabled();
            expect(submittedButton).not.toHaveAttribute('href');
            expect(
                screen.getByRole('button', {
                    name: /tokenSubmitVote.buttons.change.vote/,
                }),
            ).toBeInTheDocument();
        },
    );

    it('renders only the voted control when the recorded option is No', () => {
        mockObjectionStatus({ voteOption: VoteOption.NO });
        render(createTestComponent());

        expect(
            screen.getByRole('button', {
                name: /tokenSubmitVote.buttons.submitted/,
            }),
        ).toBeDisabled();
        expect(
            screen.queryByRole('button', {
                name: /tokenSubmitVote.buttons.change.vote/,
            }),
        ).not.toBeInTheDocument();
    });

    it('renders nothing until the objection status has settled', () => {
        mockObjectionStatus({ isFetched: false });
        const { container } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();
    });

    it('presents the objection restriction once, only enables No, and submits a regular objection vote', async () => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));

        render(createTestComponent({ isVeto: true }));

        await userEvent.click(
            screen.getByRole('button', {
                name: /tokenSubmitVote.buttons.vote/,
            }),
        );

        const question = screen.getByText(/tokenSubmitVote.options.label/);
        const objectionHelpText = screen.getAllByText(
            /alchemixSubmitVote.options.objectionOnly/,
        );
        const yesOption = screen.getByRole('radio', {
            name: /tokenSubmitVote.options.yes/,
        });
        const abstainOption = screen.getByRole('radio', {
            name: /tokenSubmitVote.options.abstain/,
        });
        const noOption = screen.getByRole('radio', {
            name: /tokenSubmitVote.options.no/,
        });
        const objectionHelp = objectionHelpText[0];

        expect(objectionHelpText).toHaveLength(1);
        expect(question.closest('label')).toContainElement(objectionHelp);
        expect(
            question.compareDocumentPosition(objectionHelp) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
        expect(
            objectionHelp.compareDocumentPosition(yesOption) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
        expect(yesOption).toHaveTextContent(
            /tokenSubmitVote.options.vetoYesDescription/,
        );
        expect(noOption).toHaveTextContent(
            /tokenSubmitVote.options.vetoNoDescription/,
        );
        expect(yesOption).toBeDisabled();
        expect(abstainOption).toBeDisabled();
        expect(noOption).toBeEnabled();

        await userEvent.click(noOption);
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
                        labelDescription:
                            'app.plugins.token.tokenSubmitVote.voteDescription.veto',
                        value: VoteOption.NO,
                    }),
                }),
            }),
        );
        expect(
            (open.mock.calls[0][1].params as IVoteDialogParams).vote,
        ).not.toHaveProperty('voteType');
    });

    it('uses the standard approve descriptions in approve mode', async () => {
        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: /tokenSubmitVote.buttons.vote/,
            }),
        );

        expect(
            screen.getByRole('radio', {
                name: /tokenSubmitVote.options.yes/,
            }),
        ).toHaveTextContent(/tokenSubmitVote.options.approveYesDescription/);
        expect(
            screen.getByRole('radio', {
                name: /tokenSubmitVote.options.no/,
            }),
        ).toHaveTextContent(/tokenSubmitVote.options.approveNoDescription/);
    });

    it('refetches objection status on confirmation and again after indexing', async () => {
        const open = jest.fn();
        const { refetch } = mockObjectionStatus();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));

        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: /tokenSubmitVote.buttons.vote/,
            }),
        );
        await userEvent.click(
            screen.getByRole('radio', {
                name: /tokenSubmitVote.options.no/,
            }),
        );
        await userEvent.click(
            screen.getByRole('button', {
                name: /tokenSubmitVote.buttons.submit/,
            }),
        );

        const params = open.mock.calls[0][1].params as IVoteDialogParams;

        act(() => params.onSuccess?.());
        expect(refetch).toHaveBeenCalledTimes(1);
        expect(params.onIndexed).toEqual(expect.any(Function));

        act(() => params.onIndexed?.());
        expect(refetch).toHaveBeenCalledTimes(2);
    });
});
