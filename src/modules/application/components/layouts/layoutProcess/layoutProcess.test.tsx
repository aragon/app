import { render, screen } from '@testing-library/react';
import { LayoutProcess, type ILayoutProcessProps } from './layoutProcess';

jest.mock('../../navigations/navigationProcess', () => ({
    NavigationProcess: () => <div data-testid="navigation-process-mock" />,
}));

describe('<LayoutProcess /> component', () => {
    const createTestComponent = (props?: Partial<ILayoutProcessProps>) => {
        const completeProps: ILayoutProcessProps = { ...props };

        return <LayoutProcess {...completeProps} />;
    };

    it('renders the navigation process and children property', () => {
        const children = 'test-children';
        render(createTestComponent({ children }));
        expect(screen.getByTestId('navigation-process-mock')).toBeInTheDocument();
        expect(screen.getByText(children)).toBeInTheDocument();
    });
});
