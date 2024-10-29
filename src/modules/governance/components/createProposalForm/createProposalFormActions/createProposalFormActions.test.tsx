import * as daoService from '@/shared/api/daoService';
import { FormWrapper, generateDao, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { forwardRef } from 'react';
import { CreateProposalFormActions, type ICreateProposalFormActionsProps } from './createProposalFormActions';

jest.mock('../../actionComposer', () => ({
    // eslint-disable-next-line react/display-name
    ActionComposer: forwardRef(() => <div data-testid="action-composer-mock" />),
}));

describe('<CreateProposalFormActions /> component', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');

        beforeEach(() => {
            useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
        });

        afterEach(() => {
            useDaoSpy.mockReset();
        });

    const createTestComponent = (props?: Partial<ICreateProposalFormActionsProps>) => {
        const completeProps: ICreateProposalFormActionsProps = {
            daoId: 'test',
            pluginAddress: 'test-plugin',
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
        const actionButton = screen.getByRole('button', { name: /createProposalForm.actions.action/ });
        expect(actionButton).toBeInTheDocument();
    });
});
