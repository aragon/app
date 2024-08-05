import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { render, screen } from '@testing-library/react';
import { type IPageErrorProps, PageError } from './pageError';

describe('<Page.Error /> component', () => {
    const isNotFoundErrorSpy = jest.spyOn(AragonBackendServiceError, 'isNotFoundError');

    afterEach(() => {
        isNotFoundErrorSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IPageErrorProps>) => {
        const completeProps: IPageErrorProps = {
            error: null,
            actionLink: '',
            notFoundNamespace: '',
            ...props,
        };

        return <PageError {...completeProps} />;
    };

    it('renders a generic error but uses the specified label for primary action when error is not a not-found error', () => {
        const actionLink = '/explore';
        const notFoundNamespace = 'app.governance.memberDetailsPage';
        isNotFoundErrorSpy.mockReturnValue(false);

        render(createTestComponent({ actionLink, notFoundNamespace, error: 'error' }));
        expect(screen.getByText(/errorFeedback.title/)).toBeInTheDocument();
        expect(screen.getByText(/errorFeedback.description/)).toBeInTheDocument();
        expect(screen.getByText(/errorFeedback.link.report/)).toBeInTheDocument();

        const customLink = screen.getByRole('link', { name: `${notFoundNamespace}.notFound.action` });
        expect(customLink).toBeInTheDocument();
        expect(customLink.getAttribute('href')).toEqual(actionLink);
    });

    it('renders the not-found specific strings without the report button when error is a not-found error', () => {
        const actionLink = '/proposals';
        const notFoundNamespace = 'app.governance.proposalDetailsPage';
        isNotFoundErrorSpy.mockReturnValue(true);

        render(createTestComponent({ actionLink, notFoundNamespace, error: '404-error' }));
        expect(screen.getByText(`${notFoundNamespace}.notFound.title`)).toBeInTheDocument();
        expect(screen.getByText(`${notFoundNamespace}.notFound.description`)).toBeInTheDocument();

        const customLink = screen.getByRole('link', { name: `${notFoundNamespace}.notFound.action` });
        expect(customLink).toBeInTheDocument();
        expect(customLink.getAttribute('href')).toEqual(actionLink);

        expect(screen.queryByText(/errorFeedback.link.report/)).not.toBeInTheDocument();
    });
});
