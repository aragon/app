import { EmptyState, IconType, type IEmptyStateBaseProps, type IllustrationObjectType } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IErrorFeedbackProps {
    /**
     * Translation key for the error title.
     * @default app.shared.errorFeedback.title
     */
    titleKey?: string;
    /**
     * Translation key for the error description.
     * @default app.shared.errorFeedback.description
     */
    descriptionKey?: string;
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
    const { titleKey, descriptionKey, illustration = 'WARNING', primaryButton, hideReportButton } = props;

    const { t } = useTranslations();

    const reportIssueButton = {
        label: t('app.shared.errorFeedback.link.report'),
        href: 'https://aragonassociation.atlassian.net/servicedesk/customer/portal/3',
        target: '_blank',
        iconRight: IconType.LINK_EXTERNAL,
    };

    const processedTitle = t(titleKey ?? 'app.shared.errorFeedback.title');
    const processedDescription = t(descriptionKey ?? 'app.shared.errorFeedback.description');

    const processedPrimaryButton = primaryButton ?? { label: t('app.shared.errorFeedback.link.explore'), href: '/' };
    const processedSecondaryButton = hideReportButton ? undefined : reportIssueButton;

    return (
        <div className="flex grow items-center justify-center">
            <EmptyState
                description={processedDescription}
                heading={processedTitle}
                objectIllustration={{ object: illustration }}
                primaryButton={processedPrimaryButton}
                secondaryButton={processedSecondaryButton}
            />
        </div>
    );
};
