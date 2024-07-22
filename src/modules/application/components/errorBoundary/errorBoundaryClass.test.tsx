import { testLogger } from '@/test/utils';
import { render, screen } from '@testing-library/react';
import { ErrorBoundaryClass, type IErrorBoundaryClassProps } from './errorBoundaryClass';

describe('<ErrorBoundary /> component', () => {
    const createTestComponent = (props?: Partial<IErrorBoundaryClassProps>) => {
        const completeProps: IErrorBoundaryClassProps = { ...props };

        return <ErrorBoundaryClass {...completeProps} />;
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

    it('resets the error state on pathname change', () => {
        testLogger.suppressErrors();
        const initialPathname = '/explore';
        const ChildrenError = () => {
            throw new Error('Test error');
        };

        const { rerender } = render(createTestComponent({ pathname: initialPathname, children: <ChildrenError /> }));
        expect(screen.getByText(/errorBoundaryFeedback.title/)).toBeInTheDocument();

        const newPathname = '/create';
        const children = 'new-children';
        rerender(createTestComponent({ pathname: newPathname, children }));

        expect(screen.getByText(children)).toBeInTheDocument();
    });
});
