import { useTranslations } from '@/shared/components/translationsProvider';

export interface ISppNonActiveStatusProps {
    /**
     * Name of the body.
     */
    name: string;
    /**
     * Is optimistic stage
     */
    isOptimistic: boolean;
    /**
     * Is approval reached
     */
    isApprovalReached: boolean;
}

export const SppNonActiveStatus: React.FC<ISppNonActiveStatusProps> = (props) => {
    const { name, isOptimistic, isApprovalReached } = props;

    const { t } = useTranslations();

    const approvalText = isApprovalReached ? 'approved' : 'notApproved';
    const vetoText = isApprovalReached ? 'vetoed' : 'notVetoed';
    const statusText = isOptimistic ? vetoText : approvalText;

    const statusClass =
        isApprovalReached && isOptimistic
            ? 'text-critical-800'
            : isApprovalReached
              ? 'text-success-800'
              : 'text-neutral-500';

    return (
        <p>
            {name}{' '}
            <span className={statusClass}>{t(`app.plugins.token.tokenProposalVotingSummary.${statusText}`)}</span>
        </p>
    );
};
