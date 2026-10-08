import { render, screen } from '@testing-library/react';
import { testLogger } from '@/test/utils';
import {
    ErrorBoundaryClass,
    type IErrorBoundaryClassProps,
} from './errorBoundaryClass';

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
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('renders the fallback property instead of the error feedback when set', () => {
        testLogger.suppressErrors();

        const Children = () => {
            throw new Error('Test error');
        };
        const fallback = 'custom-fallback';

        render(createTestComponent({ children: <Children />, fallback }));
        expect(screen.getByText(fallback)).toBeInTheDocument();
        expect(
            screen.queryByText('Something went wrong'),
        ).not.toBeInTheDocument();
    });

    it('rethrows the errors Next throws for its own control flow, e.g. notFound()', () => {
        testLogger.suppressErrors();

        const ChildrenNotFound = () => {
            const error = new Error('NEXT_HTTP_ERROR_FALLBACK;404');
            (error as Error & { digest: string }).digest =
                'NEXT_HTTP_ERROR_FALLBACK;404';

            throw error;
        };

        // The error must reach the not-found boundary Next places above this one instead of being turned into the
        // error feedback here, therefore it leaves this boundary as it came in.
        expect(() =>
            render(createTestComponent({ children: <ChildrenNotFound /> })),
        ).toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
        expect(
            screen.queryByText(/errorFeedback.title/),
        ).not.toBeInTheDocument();
    });

    it('resets the error state on pathname change', () => {
        testLogger.suppressErrors();
        const initialPathname = '/explore';
        const ChildrenError = () => {
            throw new Error('Test error');
        };

        const { rerender } = render(
            createTestComponent({
                pathname: initialPathname,
                children: <ChildrenError />,
            }),
        );
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();

        const newPathname = '/create';
        const children = 'new-children';
        rerender(createTestComponent({ pathname: newPathname, children }));

        expect(screen.getByText(children)).toBeInTheDocument();
    });
});
