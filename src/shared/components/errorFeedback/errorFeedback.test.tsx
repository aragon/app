import { render, screen } from '@testing-library/react';
import { ErrorFeedback, type IErrorFeedbackProps } from './errorFeedback';

describe('<ErrorFeedback /> component', () => {
    const createTestComponent = (props?: Partial<IErrorFeedbackProps>) => {
        const completeProps: IErrorFeedbackProps = { ...props };

        return <ErrorFeedback {...completeProps} />;
    };

    it('renders the error title and description', () => {
        render(createTestComponent());
        expect(screen.getByText(/errorFeedback.title/)).toBeInTheDocument();
        expect(screen.getByText(/errorFeedback.description/)).toBeInTheDocument();
    });

    it('renders the correct CTAs', () => {
        render(createTestComponent());

        const exploreDaosButton = screen.getByRole('link', { name: /errorFeedback.link.explore/ });
        const reportIssueButton = screen.getByRole('link', { name: /errorFeedback.link.report/ });

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
