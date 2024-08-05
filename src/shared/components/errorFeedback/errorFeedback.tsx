import { useTranslations } from '@/shared/components/translationsProvider';
import { EmptyState, IconType, type IEmptyStateBaseProps, type IllustrationObjectType } from '@aragon/ods';

export interface IErrorFeedbackProps {
    /**
     * Custom error title.
     * @default app.shared.errorFeedback.title
     */
    title?: string;
    /**
     * Custom error description.
     * @default app.shared.errorFeedback.description
     */
    description?: string;
    /**
     * Custom object illustration.
     * @default 'WARNING'
     */
    illustration?: IllustrationObjectType;
    /**
     * Custom primary button.
     * @default explore
     */
    primaryButton?: IEmptyStateBaseProps['primaryButton'];
    /**
     * Hides the report issue button when set to true.
     */
    hideReportButton?: boolean;
}

export const ErrorFeedback: React.FC<IErrorFeedbackProps> = (props) => {
    const { title, description, illustration = 'WARNING', primaryButton, hideReportButton } = props;

    const { t } = useTranslations();

    const reportIssueButton = {
        label: t('app.shared.errorFeedback.link.report'),
        href: 'https://aragonassociation.atlassian.net/servicedesk/customer/portal/3',
        target: '_blank',
        iconRight: IconType.LINK_EXTERNAL,
    };

    const processedTitle = title ?? t('app.shared.errorFeedback.title');
    const processedDescription = description ?? t('app.shared.errorFeedback.description');

    const processedPrimaryButton = primaryButton ?? { label: t('app.shared.errorFeedback.link.explore'), href: '/' };
    const processedSecondaryButton = hideReportButton ? undefined : reportIssueButton;

    return (
        <div className="flex grow items-center justify-center">
            <EmptyState
                heading={processedTitle}
                description={processedDescription}
                objectIllustration={{ object: illustration }}
                primaryButton={processedPrimaryButton}
                secondaryButton={processedSecondaryButton}
            />
        </div>
    );
};
