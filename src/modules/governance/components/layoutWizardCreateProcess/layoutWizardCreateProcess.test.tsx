import { type ILayoutWizardProps } from '@/modules/application/components/layouts/layoutWizard';
import { render, screen } from '@testing-library/react';
import { type ILayoutWizardCreateProcessProps, LayoutWizardCreateProcess } from './layoutWizardCreateProcess';

jest.mock('@/modules/application/components/layouts/layoutWizard', () => ({
    LayoutWizard: (props: ILayoutWizardProps) => {
        const { name } = props;
        return <div data-testid="layout-wizard-mock">{name as string}</div>;
    },
}));

describe('<LayoutWizardCreateProcess /> component', () => {
    const createTestComponent = (props?: Partial<ILayoutWizardCreateProcessProps>) => {
        const completeProps: ILayoutWizardCreateProcessProps = {
            params: {
                id: 'test-id',
            },
            ...props,
        };

        return <LayoutWizardCreateProcess {...completeProps} />;
    };

    it('renders and passes its hardcoded name prop to children', () => {
        render(createTestComponent());
        expect(screen.getByTestId('layout-wizard-mock')).toHaveTextContent(
            'app.governance.layoutWizardCreateProcess.name',
        );
    });
});
