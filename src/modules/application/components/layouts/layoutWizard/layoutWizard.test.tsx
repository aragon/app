import { render, screen } from '@testing-library/react';
import { LayoutWizard, type ILayoutProcessProps } from './layoutWizard';

jest.mock('../../navigations/navigationWizard', () => ({
    NavigationWizard: () => <div data-testid="navigation-process-mock" />,
}));

describe('<LayoutWizard /> component', () => {
    const createTestComponent = (props?: Partial<ILayoutProcessProps>) => {
        const completeProps: ILayoutProcessProps = { ...props };

        return <LayoutWizard {...completeProps} />;
    };

    it('renders the navigation process and children property', () => {
        const children = 'test-children';
        render(createTestComponent({ children }));
        expect(screen.getByTestId('navigation-process-mock')).toBeInTheDocument();
        expect(screen.getByText(children)).toBeInTheDocument();
    });
});
