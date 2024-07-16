import { render, screen } from '@testing-library/react';
import { ErrorFallback } from './errorFallback';

describe('<ErrorFallback /> component', () => {
    it('renders title and description', () => {
        render(<ErrorFallback />);
        expect(screen.getByText('app.application.errorFallback.title')).toBeInTheDocument();
        expect(screen.getByText('app.application.errorFallback.description')).toBeInTheDocument();
    });

    it('renders buttons with correct text and links', () => {
        render(<ErrorFallback />);

        const exploreDaosButton = screen.getByRole('link', { name: /app.application.errorFallback.explore/i });
        const reportIssueButton = screen.getByRole('link', { name: /app.application.errorFallback.report/i });

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
