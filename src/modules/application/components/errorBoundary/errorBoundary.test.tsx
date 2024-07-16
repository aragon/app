import { testLogger } from '@/test/utils';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary, type IErrorBoundaryProps } from './errorBoundary';

describe('<ErrorBoundary /> component', () => {
    const createTestComponent = (props?: Partial<IErrorBoundaryProps>) => {
        const completeProps: IErrorBoundaryProps = { ...props };

        return <ErrorBoundary {...completeProps} />;
    };

    it('renders the children property when no error occurs', () => {
        const children = 'child-component';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    it('renders an error feedback when an error occurs on a children component', () => {
        testLogger.suppressErrors();

        const Children = () => {
            throw new Error('Test error');
        };

        render(createTestComponent({ children: <Children /> }));
        expect(screen.getByText(/errorBoundaryFeedback.title/)).toBeInTheDocument();
    });
});
