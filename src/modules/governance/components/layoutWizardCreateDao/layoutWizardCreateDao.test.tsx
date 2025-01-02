import { type ILayoutWizardProps } from '@/modules/application/components/layouts/layoutWizard';
import { render, screen } from '@testing-library/react';
import { type ILayoutWizardCreateDaoProps, LayoutWizardCreateDao } from './layoutWizardCreateDao';

jest.mock('@/modules/application/components/layouts/layoutWizard', () => ({
    LayoutWizard: (props: ILayoutWizardProps) => <div data-testid="layout-wizard-mock">{props.name.toString()}</div>,
}));

describe('<LayoutWizardCreateDao /> component', () => {
    const createTestComponent = (props?: Partial<ILayoutWizardCreateDaoProps>) => {
        const completeProps: ILayoutWizardCreateDaoProps = {
            ...props,
        };

        return <LayoutWizardCreateDao {...completeProps} />;
    };

    it('renders and passes the create-dao wizard name prop to children', () => {
        render(createTestComponent());
        expect(screen.getByTestId('layout-wizard-mock')).toBeInTheDocument();
        expect(screen.getByText(/layoutWizardCreateDao.name/)).toBeInTheDocument();
    });
});
