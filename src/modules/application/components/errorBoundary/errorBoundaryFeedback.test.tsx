import { render, screen } from '@testing-library/react';
import { ErrorBoundaryFeedback, type IErrorBoundaryFeedbackProps } from './errorBoundaryFeedback';

describe('<ErrorBoundaryFeedback /> component', () => {
    const createTestComponent = (props?: Partial<IErrorBoundaryFeedbackProps>) => {
        const completeProps: IErrorBoundaryFeedbackProps = { ...props };

        return <ErrorBoundaryFeedback {...completeProps} />;
    };

    it('renders the error title and description', () => {
        render(createTestComponent());
        expect(screen.getByText(/errorBoundaryFeedback.title/)).toBeInTheDocument();
        expect(screen.getByText(/errorBoundaryFeedback.description/)).toBeInTheDocument();
    });

    it('renders the correct CTAs', () => {
        render(createTestComponent());

        const exploreDaosButton = screen.getByRole('link', { name: /errorBoundaryFeedback.link.explore/ });
        const reportIssueButton = screen.getByRole('link', { name: /errorBoundaryFeedback.link.report/ });

        expect(exploreDaosButton).toBeInTheDocument();
        expect(exploreDaosButton).toHaveAttribute('href', '/');

        expect(reportIssueButton).toBeInTheDocument();
        expect(reportIssueButton).toHaveAttribute(
            'href',
            'https://aragonassociation.atlassian.net/servicedesk/customer/portal/3',
        );
        expect(reportIssueButton).toHaveAttribute('target', '_blank');
    });
});
