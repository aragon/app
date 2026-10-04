import { render, screen } from '@testing-library/react';
import translations from '@/assets/locales/en.json';
import { ErrorFeedback, type IErrorFeedbackProps } from './errorFeedback';

describe('<ErrorFeedback /> component', () => {
    const { title, description, link } = translations.app.shared.errorFeedback;

    const createTestComponent = (props?: Partial<IErrorFeedbackProps>) => {
        const completeProps: IErrorFeedbackProps = { ...props };

        return <ErrorFeedback {...completeProps} />;
    };

    it('renders the default error title and description as text without a translations provider', () => {
        render(createTestComponent());
        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByText(description)).toBeInTheDocument();
    });

    it('renders the correct default CTAs', () => {
        render(createTestComponent());

        const exploreDaosButton = screen.getByRole('link', {
            name: link.explore,
        });
        const reportIssueButton = screen.getByRole('link', {
            name: link.report,
        });

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
        const titleKey = 'test-title';
        const descriptionKey = 'test-description';
        const illustration = 'NOT_FOUND';
        const primaryButton = { label: 'test-primary-button', href: '/test' };
        render(
            createTestComponent({
                titleKey,
                descriptionKey,
                illustration,
                primaryButton,
            }),
        );

        expect(screen.getByText(titleKey)).toBeInTheDocument();
        expect(screen.getByText(descriptionKey)).toBeInTheDocument();
        expect(screen.getByTestId(illustration)).toBeInTheDocument();

        const button = screen.getByRole('link', { name: primaryButton.label });
        expect(button).toBeInTheDocument();
        expect(button.getAttribute('href')).toEqual(primaryButton.href);
    });

    it('hides the report button when the hideReportButton property is set to true', () => {
        const hideReportButton = true;
        render(createTestComponent({ hideReportButton }));
        expect(
            screen.queryByRole('link', { name: link.report }),
        ).not.toBeInTheDocument();
    });
});
