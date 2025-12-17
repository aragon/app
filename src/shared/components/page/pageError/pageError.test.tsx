import { render, screen } from '@testing-library/react';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { type IPageErrorProps, PageError } from './pageError';

describe('<Page.Error /> component', () => {
    const isNotFoundErrorSpy = jest.spyOn(AragonBackendServiceError, 'isNotFoundError');

    afterEach(() => {
        isNotFoundErrorSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IPageErrorProps>) => {
        const completeProps: IPageErrorProps = { ...props };

        return <PageError {...completeProps} />;
    };

    it('renders a generic error with the specified action link', () => {
        const actionLink = '/explore';
        const errorNamespace = 'app.governance.memberDetailsPage';

        render(createTestComponent({ actionLink, errorNamespace, error: 'error' }));

        expect(screen.getByText(/errorFeedback.title/)).toBeInTheDocument();
        expect(screen.getByText(/errorFeedback.description/)).toBeInTheDocument();
        expect(screen.getByText(/errorFeedback.link.report/)).toBeInTheDocument();

        const customLink = screen.getByRole('link', {
            name: `${errorNamespace}.action`,
        });
        expect(customLink).toBeInTheDocument();
        expect(customLink.getAttribute('href')).toEqual(actionLink);
    });

    it('renders a not-found feedback when the error is a not-found error', () => {
        const actionLink = '/proposals';
        const errorNamespace = 'app.governance.proposalDetailsPage';
        isNotFoundErrorSpy.mockReturnValue(true);

        render(createTestComponent({ actionLink, errorNamespace }));
        expect(screen.getByText(`${errorNamespace}.notFound.title`)).toBeInTheDocument();
        expect(screen.getByText(`${errorNamespace}.notFound.description`)).toBeInTheDocument();

        const customLink = screen.getByRole('link', {
            name: `${errorNamespace}.action`,
        });
        expect(customLink).toBeInTheDocument();
        expect(customLink.getAttribute('href')).toEqual(actionLink);

        expect(screen.queryByText(/errorFeedback.link.report/)).not.toBeInTheDocument();
    });

    it('renders the specified error title and description', () => {
        const titleKey = 'app.error.title';
        const descriptionKey = 'app.error.description';

        render(createTestComponent({ titleKey, descriptionKey }));

        expect(screen.getByText(titleKey)).toBeInTheDocument();
        expect(screen.getByText(descriptionKey)).toBeInTheDocument();
    });
});
