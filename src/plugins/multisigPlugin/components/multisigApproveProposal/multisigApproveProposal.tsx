import { useTranslations } from '@/shared/components/translationsProvider';
import { Button } from '@aragon/ods';

export interface IMultisigApproveProposalProps {}

export const MultisigApproveProposal: React.FC<IMultisigApproveProposalProps> = () => {
    const { t } = useTranslations();
    return (
        <div className="pt-4">
            <Button size="md" variant="primary">
                {t('app.plugins.multisig.multisigApproveProposal.button')}
            </Button>
        </div>
    );
};
