import { render, screen, within } from '@testing-library/react';
import * as NextNavigation from 'next/navigation';
import { FeatureFlagsProvider } from '@/shared/components/featureFlagsProvider';
import { ErrorBoundary, type IErrorBoundaryProps } from './errorBoundary';
import type { IErrorBoundaryClassProps } from './errorBoundaryClass';

jest.mock('./errorBoundaryClass', () => ({
    ErrorBoundaryClass: (props: IErrorBoundaryClassProps) => (
        <div data-pathname={props.pathname}>
            {props.children}
            <div data-testid="fallback">{props.fallback}</div>
        </div>
    ),
}));

describe('<ErrorBoundary /> component', () => {
    const usePathnameSpy = jest.spyOn(NextNavigation, 'usePathname');

    afterEach(() => {
        usePathnameSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IErrorBoundaryProps>,
        workspacesEnabled = false,
    ) => {
        const completeProps: IErrorBoundaryProps = { ...props };

        return (
            <FeatureFlagsProvider
                initialSnapshot={[
                    {
                        key: 'workspaces',
                        name: 'Workspaces',
                        description: '',
                        enabled: workspacesEnabled,
                    },
                ]}
            >
                <ErrorBoundary {...completeProps} />
            </FeatureFlagsProvider>
        );
    };

    it('gets current pathname and passes it to the ErrorBoundaryClass component', () => {
        const pathname = '/test';
        const children = 'test-child';
        usePathnameSpy.mockReturnValue(pathname);
        render(createTestComponent({ children }));

        const child = screen.getByText(children);
        expect(child).toBeInTheDocument();
        expect(child.dataset.pathname).toEqual(pathname);
    });

    it('routes the default error action to Explore when workspaces are enabled', () => {
        usePathnameSpy.mockReturnValue('/test');
        render(createTestComponent(undefined, true));

        expect(
            within(screen.getByTestId('fallback')).getByRole('link', {
                name: 'Explore DAOs',
            }),
        ).toHaveAttribute('href', '/explore');
    });
});
