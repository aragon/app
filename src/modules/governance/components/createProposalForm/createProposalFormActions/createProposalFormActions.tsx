import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, CardEmptyState, IconType } from '@aragon/ods';

export interface ICreateProposalFormActionsProps {}

export const CreateProposalFormActions: React.FC<ICreateProposalFormActionsProps> = () => {
    const { t } = useTranslations();

    return (
        <div className="flex flex-col gap-y-10">
            <CardEmptyState
                heading={t('app.governance.createProposal.createProposalFormActions.emptyState.heading')}
                description={t('app.governance.createProposal.createProposalFormActions.emptyState.description')}
                objectIllustration={{ object: 'SMART_CONTRACT' }}
                isStacked={false}
            />
            <div>
                <Button variant="primary" size="md" iconLeft={IconType.PLUS}>
                    {t('app.governance.createProposal.createProposalFormActions.buttons.action')}
                </Button>
            </div>
        </div>
    );
};
