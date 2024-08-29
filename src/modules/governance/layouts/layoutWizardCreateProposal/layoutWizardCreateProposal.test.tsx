import { type ILayoutWizardProps } from '@/modules/application/components/layouts/layoutWizard';
import { render, screen } from '@testing-library/react';
import { type ILayoutWizardCreateProposalProps, LayoutWizardCreateProposal } from './layoutWizardCreateProposal';

jest.mock('@/modules/application/components/layouts/layoutWizard', () => ({
    LayoutWizard: (props: ILayoutWizardProps) => {
        const { name } = props;
        return <div data-testid="layout-wizard-mock">{name}</div>;
    },
}));

describe('<LayoutWizardCreateProposal /> component', () => {
    const createTestComponent = (props?: Partial<ILayoutWizardCreateProposalProps>) => {
        const completeProps: ILayoutWizardCreateProposalProps = {
            ...props,
        };

        return <LayoutWizardCreateProposal {...completeProps} />;
    };

    it('renders and passes its hardcoded name prop to children', () => {
        render(createTestComponent());
        expect(screen.getByTestId('layout-wizard-mock')).toHaveTextContent(
            'app.governance.layoutWizardCreateProposal.name',
        );
    });
});
