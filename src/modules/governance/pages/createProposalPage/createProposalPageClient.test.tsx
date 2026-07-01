import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as usePermissionCheckGuard from '@/modules/governance/hooks/usePermissionCheckGuard';
import * as daoService from '@/shared/api/daoService';
import { TransactionType } from '@/shared/api/transactionService';
import * as DialogProvider from '@/shared/components/dialogProvider';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import {
    generateDao,
    generateDaoPlugin,
    generateDialogContext,
    generateFilterComponentPlugin,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import {
    PendingTransactionStatus,
    pendingTransactionManager,
} from '@/shared/utils/pendingTransactionManager';
import { GovernanceDialogId } from '../../constants/governanceDialogId';
import {
    CreateProposalPageClient,
    type ICreateProposalPageClientProps,
} from './createProposalPageClient';

jest.mock('./createProposalPageClientSteps', () => ({
    CreateProposalPageClientSteps: () => (
        <button data-testid="steps-mock" type="submit" />
    ),
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

describe('<CreateProposalPageClient /> component', () => {
    const useDialogContextSpy = jest.spyOn(DialogProvider, 'useDialogContext');
    const usePermissionCheckGuardSpy = jest.spyOn(
        usePermissionCheckGuard,
        'usePermissionCheckGuard',
    );
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const getActiveSpy = jest.spyOn(pendingTransactionManager, 'getActive');

    beforeEach(() => {
        getActiveSpy.mockReturnValue([]);
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        usePermissionCheckGuardSpy.mockReturnValue({
            check: jest.fn(),
            result: false,
        });
        useDaoPluginsSpy.mockReturnValue([generateFilterComponentPlugin()]);
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
        usePermissionCheckGuardSpy.mockReset();
        useDaoPluginsSpy.mockReset();
        useDaoSpy.mockReset();
        getActiveSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<ICreateProposalPageClientProps>,
    ) => {
        const completeProps: ICreateProposalPageClientProps = {
            daoId: 'test',
            pluginAddress: '0x123',
            ...props,
        };

        return <CreateProposalPageClient {...completeProps} />;
    };

    it('renders the create-proposal wizard steps', async () => {
        render(createTestComponent());
        expect(
            await screen.findByText(/wizardPage.container.step \(number=1\)/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/wizardPage.container.total \(total=3\)/),
        ).toBeInTheDocument();
        expect(screen.getByTestId('steps-mock')).toBeInTheDocument();
    });

    it('opens the publish proposal dialog on form submit', async () => {
        const daoId = 'test-id';
        const pluginAddress = '0x472839';
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));
        const plugins = [
            generateFilterComponentPlugin({
                id: 'multisig',
                meta: generateDaoPlugin({ address: pluginAddress }),
            }),
        ];
        useDaoPluginsSpy.mockReturnValue(plugins);
        render(createTestComponent({ daoId, pluginAddress }));
        // Advance the wizard three times to trigger the submit function
        await userEvent.click(screen.getByTestId('steps-mock'));
        await userEvent.click(screen.getByTestId('steps-mock'));
        await userEvent.click(screen.getByTestId('steps-mock'));
        const expectedParams = {
            proposal: { actions: [] },
            daoId,
            plugin: plugins[0].meta,
            prepareActions: {},
        };
        expect(open).toHaveBeenCalledWith(GovernanceDialogId.PUBLISH_PROPOSAL, {
            params: expectedParams,
        });
    });

    it('warns instead of publishing when another proposal creation is already in flight', async () => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));
        useDaoPluginsSpy.mockReturnValue([
            generateFilterComponentPlugin({
                meta: generateDaoPlugin({ address: '0x123' }),
            }),
        ]);
        // A different in-flight proposal creation for this DAO + plugin.
        getActiveSpy.mockReturnValue([
            ['other-intent', { status: PendingTransactionStatus.SUBMITTED }],
        ]);
        render(createTestComponent());

        await userEvent.click(screen.getByTestId('steps-mock'));
        await userEvent.click(screen.getByTestId('steps-mock'));
        await userEvent.click(screen.getByTestId('steps-mock'));

        expect(getActiveSpy).toHaveBeenCalledWith(
            expect.objectContaining({ type: TransactionType.PROPOSAL_CREATE }),
        );
        expect(open).toHaveBeenCalledWith(
            GovernanceDialogId.DUPLICATE_PROPOSAL_WARNING,
            { params: { onProceed: expect.any(Function) } },
        );
        expect(open).not.toHaveBeenCalledWith(
            GovernanceDialogId.PUBLISH_PROPOSAL,
            expect.anything(),
        );

        // Proceeding from the warning opens the publish dialog for the new proposal.
        const warnCall = open.mock.calls.find(
            ([id]) => id === GovernanceDialogId.DUPLICATE_PROPOSAL_WARNING,
        );
        warnCall![1].params.onProceed();
        expect(open).toHaveBeenCalledWith(
            GovernanceDialogId.PUBLISH_PROPOSAL,
            expect.anything(),
        );
    });
});
