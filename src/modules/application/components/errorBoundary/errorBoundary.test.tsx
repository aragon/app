import { render, screen } from '@testing-library/react';
import { ErrorBoundary, type IErrorBoundaryProps } from './errorBoundary';

jest.mock('./errorFallback', () => ({
    ErrorFallback: () => <div>Error fallback</div>,
}));

describe('<ErrorBoundary /> component', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error');

    const createTestComponent = (props?: Partial<IErrorBoundaryProps>) => {
        const completeProps: IErrorBoundaryProps = { children: <div>Child component</div>, ...props };

        return <ErrorBoundary {...completeProps} />;
    };

    beforeEach(() => {
        consoleErrorSpy.mockImplementation(jest.fn());
    });

    afterEach(() => {
        consoleErrorSpy.mockReset();
    });

    const ThrowErrorComponent = () => {
        throw new Error('Test error');
    };

    it('renders children when no error occurs', () => {
        const children = <div>Child Component</div>;
        render(createTestComponent({ children }));

        expect(screen.getByText('Child Component')).toBeInTheDocument();
    });

    it('renders ErrorFallback when an error occurs', () => {
        const children = <ThrowErrorComponent />;
        render(createTestComponent({ children }));

        expect(screen.getByText('Error fallback')).toBeInTheDocument();
    });
});
