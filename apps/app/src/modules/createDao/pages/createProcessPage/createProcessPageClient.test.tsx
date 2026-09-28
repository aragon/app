import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as proposalPermissionGuard from '@/modules/governance/hooks/useProposalPermissionCheckGuard';
import * as daoService from '@/shared/api/daoService';
import * as DialogProvider from '@/shared/components/dialogProvider';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import {
    generateDao,
    generateDialogContext,
    generateFilterComponentPlugin,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { plausibleAnalyticsUtils } from '@/shared/utils/plausibleAnalyticsUtils';
import {
    GovernanceType,
    ProcessPermission,
    ProposalCreationMode,
} from '../../components/createProcessForm';
import { CreateDaoDialogId } from '../../constants/createDaoDialogId';
import { CreateProcessPageClient } from './createProcessPageClient';

const processFormValues = {
    name: 'Governance',
    processKey: 'GOV',
    description: 'Description',
    resources: [],
    proposalCreationMode: ProposalCreationMode.ANY_WALLET,
    governanceType: GovernanceType.ADVANCED,
    permissions: ProcessPermission.ANY,
    permissionSelectors: [],
    stages: [
        { internalId: 'stage-1', name: 'Stage 1', bodies: [], settings: {} },
    ],
    existingProposalCreationConditions: [],
};

jest.mock('@/shared/components/wizards/wizardPage', () => {
    const { plausibleAnalyticsUtils } = jest.requireActual(
        '@/shared/utils/plausibleAnalyticsUtils',
    );

    return {
        WizardPage: {
            Container: ({
                analytics,
                children,
                onSubmit,
            }: {
                analytics?: {
                    flow: string;
                    props?: Record<string, string | number | boolean>;
                };
                children: React.ReactNode;
                onSubmit: (values: typeof processFormValues) => void;
            }) => {
                if (analytics != null) {
                    plausibleAnalyticsUtils.track('wizard_start', {
                        ...analytics.props,
                        flow: analytics.flow,
                    });
                }

                return (
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            onSubmit(processFormValues);
                        }}
                    >
                        {children}
                        <button data-testid="submit" type="submit" />
                    </form>
                );
            },
            Step: ({ children }: { children: React.ReactNode }) => (
                <div>{children}</div>
            ),
        },
    };
});

jest.mock('./createProcessPageSteps', () => ({
    CreateProcessPageClientSteps: () => null,
}));

describe('<CreateProcessPageClient /> component', () => {
    const useDialogContextSpy = jest.spyOn(DialogProvider, 'useDialogContext');
    const useProposalPermissionCheckGuardSpy = jest.spyOn(
        proposalPermissionGuard,
        'useProposalPermissionCheckGuard',
    );
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const trackAnalyticsSpy = jest.spyOn(plausibleAnalyticsUtils, 'track');

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        useProposalPermissionCheckGuardSpy.mockImplementation(() => undefined);
        useDaoPluginsSpy.mockReturnValue([generateFilterComponentPlugin()]);
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );
        trackAnalyticsSpy.mockImplementation(() => undefined);
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
        useProposalPermissionCheckGuardSpy.mockReset();
        useDaoPluginsSpy.mockReset();
        useDaoSpy.mockReset();
        trackAnalyticsSpy.mockReset();
    });

    const renderPage = () =>
        render(
            <CreateProcessPageClient daoId="dao-id" pluginAddress="0xPlugin" />,
        );

    it('tracks governance-designer wizard start on render', async () => {
        renderPage();

        await waitFor(() =>
            expect(trackAnalyticsSpy).toHaveBeenCalledWith('wizard_start', {
                flow: 'governance_designer',
            }),
        );
    });

    it('tracks governance-designer wizard submit with flow-specific props', async () => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));

        renderPage();
        await userEvent.click(screen.getByTestId('submit'));

        expect(trackAnalyticsSpy).toHaveBeenCalledWith('wizard_submit', {
            flow: 'governance_designer',
            setupMode: 'advanced',
            stageCount: 1,
        });
        expect(open).toHaveBeenCalledWith(CreateDaoDialogId.PREPARE_PROCESS, {
            params: {
                daoId: 'dao-id',
                pluginAddress: '0xPlugin',
                values: processFormValues,
            },
        });
    });

    it('renders a not-found state instead of the wizard when the plugin address matches no DAO plugin', () => {
        useDaoPluginsSpy.mockReturnValue([]);

        renderPage();

        expect(
            screen.getByText(
                'app.createDao.createProcessPage.error.notFound.title',
            ),
        ).toBeInTheDocument();
        expect(screen.queryByTestId('submit')).not.toBeInTheDocument();
    });
});
