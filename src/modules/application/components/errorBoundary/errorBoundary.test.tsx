import { render, screen } from '@testing-library/react';
import * as NextNavigation from 'next/navigation';
import { ErrorBoundary, type IErrorBoundaryProps } from './errorBoundary';
import type { IErrorBoundaryClassProps } from './errorBoundaryClass';

jest.mock('./errorBoundaryClass', () => ({
    ErrorBoundaryClass: (props: IErrorBoundaryClassProps) => <div data-pathname={props.pathname}>{props.children}</div>,
}));

describe('<ErrorBoundary /> component', () => {
    const usePathnameSpy = jest.spyOn(NextNavigation, 'usePathname');

    afterEach(() => {
        usePathnameSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IErrorBoundaryProps>) => {
        const completeProps: IErrorBoundaryProps = { ...props };

        return <ErrorBoundary {...completeProps} />;
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
});
