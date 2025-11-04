import * as daoService from '@/shared/api/daoService';
import * as DialogProvider from '@/shared/components/dialogProvider';
import {
    FormWrapper,
    generateDao,
    generateDaoPlugin,
    generateDialogContext,
    generatePaginatedResponse,
    generateReactQueryInfiniteResultSuccess,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as CreateProposalProvider from '../createProposalFormProvider';
import { CreateProposalFormActions, type ICreateProposalFormActionsProps } from './createProposalFormActions';

// Mock the useAllowedActions hook
const mockUseAllowedActions = jest.fn();
jest.mock('@/modules/governance/api/executeSelectorsService', () => ({
    ...jest.requireActual('@/modules/governance/api/executeSelectorsService'),
    useAllowedActions: (params: unknown, options?: unknown) => mockUseAllowedActions(params, options),
}));

describe('<CreateProposalFormActions /> component', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useDaoPermissionsSpy = jest.spyOn(daoService, 'useDaoPermissions');
    const useDialogContextSpy = jest.spyOn(DialogProvider, 'useDialogContext');
    const useCreateProposalFormContextSpy = jest.spyOn(CreateProposalProvider, 'useCreateProposalFormContext');
    const getDaoPluginsSpy = jest.spyOn(daoUtils, 'getDaoPlugins');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
        useDaoPermissionsSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({
                data: { pages: [generatePaginatedResponse({ data: [] })], pageParams: [] },
            }),
        );
        mockUseAllowedActions.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({
                data: { pages: [generatePaginatedResponse({ data: [] })], pageParams: [] },
            }),
        );
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        useCreateProposalFormContextSpy.mockReturnValue({
            prepareActions: {},
            addPrepareAction: jest.fn(),
        });
        getDaoPluginsSpy.mockReturnValue([generateDaoPlugin()]);
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useDaoPermissionsSpy.mockReset();
        mockUseAllowedActions.mockReset();
        useDialogContextSpy.mockReset();
        useCreateProposalFormContextSpy.mockReset();
        getDaoPluginsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ICreateProposalFormActionsProps>) => {
        const completeProps: ICreateProposalFormActionsProps = {
            daoId: 'test',
            pluginAddress: '0x123',
            ...props,
        };

        return (
            <GukModulesProvider>
                <FormWrapper>
                    <CreateProposalFormActions {...completeProps} />
                </FormWrapper>
            </GukModulesProvider>
        );
    };

    it('renders an empty state', () => {
        render(createTestComponent());
        // Heading string comes from GovKit so is not available via i18n key
        const emptyStateHeading = screen.getByText('No actions added');
        const emptyStateIllustration = screen.getByTestId('SMART_CONTRACT');
        expect(emptyStateHeading).toBeInTheDocument();
        expect(emptyStateIllustration).toBeInTheDocument();
    });

    it('renders a button to add an action', () => {
        render(createTestComponent());
        const actionButton = screen.getByRole('button', { name: /governance.actionComposer.addAction.default/ });
        expect(actionButton).toBeInTheDocument();
    });
});
