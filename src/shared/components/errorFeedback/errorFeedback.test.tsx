import { render, screen } from '@testing-library/react';
import { ErrorFeedback, type IErrorFeedbackProps } from './errorFeedback';

describe('<ErrorFeedback /> component', () => {
    const createTestComponent = (props?: Partial<IErrorFeedbackProps>) => {
        const completeProps: IErrorFeedbackProps = { ...props };

        return <ErrorFeedback {...completeProps} />;
    };

    it('renders the default error title and description', () => {
        render(createTestComponent());
        expect(screen.getByText(/errorFeedback.title/)).toBeInTheDocument();
        expect(screen.getByText(/errorFeedback.description/)).toBeInTheDocument();
    });

    it('renders the correct default CTAs', () => {
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

    it('supports the customisation of the title, description, illustration and primary button', () => {
        const title = 'test-title';
        const description = 'test-description';
        const illustration = 'NOT_FOUND';
        const primaryButton = { label: 'test-primary-button', href: '/test' };
        render(createTestComponent({ title, description, illustration, primaryButton }));

        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByText(description)).toBeInTheDocument();
        expect(screen.getByTestId(illustration)).toBeInTheDocument();

        const button = screen.getByRole('link', { name: primaryButton.label });
        expect(button).toBeInTheDocument();
        expect(button.getAttribute('href')).toEqual(primaryButton.href);
    });

    it('hides the report button when the hideReportButton property is set to true', () => {
        const hideReportButton = true;
        render(createTestComponent({ hideReportButton }));
        expect(screen.queryByRole('link', { name: /errorFeedback.link.report/ })).not.toBeInTheDocument();
    });
});
