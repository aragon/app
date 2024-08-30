import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, CardEmptyState, IconType } from '@aragon/ods';

export interface ICreateProposalFormActionsProps {}

export const CreateProposalFormActions: React.FC<ICreateProposalFormActionsProps> = () => {
    const { t } = useTranslations();

    return (
        <div className="flex flex-col gap-y-10">
            <CardEmptyState
                heading={t('app.governance.createProposalForm.actions.empty.heading')}
                description={t('app.governance.createProposalForm.actions.empty.description')}
                objectIllustration={{ object: 'SMART_CONTRACT' }}
                isStacked={false}
            />
            <Button variant="primary" size="md" iconLeft={IconType.PLUS} className="self-start">
                {t('app.governance.createProposalForm.actions.action')}
            </Button>
        </div>
    );
};
