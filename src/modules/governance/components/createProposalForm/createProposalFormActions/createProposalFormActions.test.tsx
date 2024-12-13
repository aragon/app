import * as daoService from '@/shared/api/daoService';
import * as DialogProvider from '@/shared/components/dialogProvider';
import { FormWrapper, generateDao, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { generateDialogContext } from '@/shared/testUtils/generators/dialogContext';
import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { forwardRef } from 'react';
import * as CreateProposalProvider from '../createProposalFormProvider';
import { CreateProposalFormActions, type ICreateProposalFormActionsProps } from './createProposalFormActions';

jest.mock('../../actionComposer', () => ({
    // eslint-disable-next-line react/display-name
    ActionComposer: forwardRef(() => <div data-testid="action-composer-mock" />),
}));

describe('<CreateProposalFormActions /> component', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useDialogContextSpy = jest.spyOn(DialogProvider, 'useDialogContext');
    const useCreateProposalFormContextSpy = jest.spyOn(CreateProposalProvider, 'useCreateProposalFormContext');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        useCreateProposalFormContextSpy.mockReturnValue({
            prepareActions: {},
            addPrepareAction: jest.fn(),
            smartContractAbis: [],
            addSmartContractAbi: jest.fn(),
        });
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useDialogContextSpy.mockReset();
        useCreateProposalFormContextSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ICreateProposalFormActionsProps>) => {
        const completeProps: ICreateProposalFormActionsProps = {
            daoId: 'test',
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
        const emptyState = screen.getByText(/createProposalForm.actions.empty/);
        expect(emptyState).toBeInTheDocument();
    });

    it('renders a button to add an action', () => {
        render(createTestComponent());
        const actionButton = screen.getByRole('button', { name: /createProposalForm.actions.addAction.default/ });
        expect(actionButton).toBeInTheDocument();
    });
});
