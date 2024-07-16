import { useTranslations } from '@/shared/components/translationsProvider';
import { EmptyState, IconType } from '@aragon/ods';

export interface IErrorBoundaryFeedbackProps {}

export const ErrorBoundaryFeedback = () => {
    const { t } = useTranslations();

    return (
        <div className="flex grow items-center justify-center">
            <EmptyState
                heading={t('app.application.errorBoundaryFeedback.title')}
                description={t('app.application.errorBoundaryFeedback.description')}
                objectIllustration={{ object: 'WARNING' }}
                primaryButton={{ label: t('app.application.errorBoundaryFeedback.link.explore'), href: '/' }}
                secondaryButton={{
                    label: t('app.application.errorBoundaryFeedback.link.report'),
                    href: 'https://aragonassociation.atlassian.net/servicedesk/customer/portal/3',
                    target: '_blank',
                    iconRight: IconType.LINK_EXTERNAL,
                }}
            />
        </div>
    );
};
