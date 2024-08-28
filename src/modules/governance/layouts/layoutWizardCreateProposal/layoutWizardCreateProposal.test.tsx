import { ILayoutWizardProps } from '@/modules/application/components/layouts/layoutWizard';
import {
    INavigationWizardProps,
    NavigationWizard,
} from '@/modules/application/components/navigations/navigationWizard';
import { render, screen } from '@testing-library/react';
import { LayoutWizardCreateProposal, type ILayoutWizardCreateProposalProps } from './layoutWizardCreateProposal';

jest.mock('@/modules/application/components/layouts/layoutWizard', () => ({
    LayoutWizard: (props: ILayoutWizardProps) => {
        const { name } = props;
        return (
            <div data-testid="layout-wizard-mock">
                <NavigationWizard name={name} />
            </div>
        );
    },
}));

jest.mock('@/modules/application/components/navigations/navigationWizard', () => ({
    NavigationWizard: (props: INavigationWizardProps) => {
        const { name } = props;
        return <div data-testid="navigation-wizard-mock">{name}</div>;
    },
}));

describe('<LayoutWizardCreateProposal /> component', () => {
    const createTestComponent = (props?: Partial<ILayoutWizardCreateProposalProps>) => {
        const completeProps: ILayoutWizardCreateProposalProps = {
            name: 'test-wiz',
            ...props,
        };

        return <LayoutWizardCreateProposal {...completeProps} />;
    };

    it('renders its hardcoded name all the way to its children', () => {
        render(createTestComponent());
        expect(screen.getByText('app.application.layoutWizardCreateProposal.name')).toBeInTheDocument();
    });
});
