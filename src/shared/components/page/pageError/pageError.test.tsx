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
            errorNamespace: '',
            ...props,
        };

        return <PageError {...completeProps} />;
    };

    it('renders a generic error but uses the specified label for primary action when error is not a not-found error', () => {
        const actionLink = '/explore';
        const errorNamespace = 'app.governance.memberDetailsPage';
        isNotFoundErrorSpy.mockReturnValue(false);

        render(createTestComponent({ actionLink, errorNamespace, error: 'error' }));
        expect(screen.getByText(/errorFeedback.title/)).toBeInTheDocument();
        expect(screen.getByText(/errorFeedback.description/)).toBeInTheDocument();
        expect(screen.getByText(/errorFeedback.link.report/)).toBeInTheDocument();

        const customLink = screen.getByRole('link', { name: `${errorNamespace}.notFound.action` });
        expect(customLink).toBeInTheDocument();
        expect(customLink.getAttribute('href')).toEqual(actionLink);
    });

    it('renders the not-found specific strings without the report button when error is a not-found error', () => {
        const actionLink = '/proposals';
        const errorNamespace = 'app.governance.proposalDetailsPage';
        isNotFoundErrorSpy.mockReturnValue(true);

        render(createTestComponent({ actionLink, errorNamespace, error: '404-error' }));
        expect(screen.getByText(`${errorNamespace}.notFound.title`)).toBeInTheDocument();
        expect(screen.getByText(`${errorNamespace}.notFound.description`)).toBeInTheDocument();

        const customLink = screen.getByRole('link', { name: `${errorNamespace}.notFound.action` });
        expect(customLink).toBeInTheDocument();
        expect(customLink.getAttribute('href')).toEqual(actionLink);

        expect(screen.queryByText(/errorFeedback.link.report/)).not.toBeInTheDocument();
    });
});
