import { type ILayoutWizardProps } from '@/modules/application/components/layouts/layoutWizard';
import { render, screen } from '@testing-library/react';
import { type ILayoutWizardCreateProposalProps, LayoutWizardCreateProposal } from './layoutWizardCreateProposal';

jest.mock('@/modules/application/components/layouts/layoutWizard', () => ({
    LayoutWizard: (props: ILayoutWizardProps) => <div data-testid="layout-wizard-mock">{props.name}</div>,
}));

describe('<LayoutWizardCreateProposal /> component', () => {
    const createTestComponent = (props?: Partial<ILayoutWizardCreateProposalProps>) => {
        const completeProps: ILayoutWizardCreateProposalProps = {
            ...props,
        };

        return <LayoutWizardCreateProposal {...completeProps} />;
    };

    it('renders and passes the create-proposal wizard name prop to children', () => {
        render(createTestComponent());
        expect(screen.getByTestId('layout-wizard-mock')).toBeInTheDocument();
        expect(screen.getByText(/layoutWizardCreateProposal.name/)).toBeInTheDocument();
    });
});
