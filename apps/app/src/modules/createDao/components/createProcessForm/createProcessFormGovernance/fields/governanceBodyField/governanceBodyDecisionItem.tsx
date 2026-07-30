import { DefinitionList } from '@aragon/gov-ui-kit';
import { SppProposalType } from '@/plugins/sppPlugin/types';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IGovernanceBodyDecisionItemProps {
    /**
     * Whether the process uses advanced (staged) governance. Approve/veto is a
     * per-body property of a stage, so the item is only rendered for advanced
     * governance.
     */
    isAdvancedGovernance?: boolean;
    /**
     * Approve/veto decision of the body within its stage.
     * @default SppProposalType.APPROVAL
     */
    proposalType?: SppProposalType;
}

/**
 * Definition-list item displaying whether a body approves or vetoes proposals
 * within its stage. Rendered as part of the body details list of each plugin,
 * so it shares the container (spacing and dividers) with the other items.
 */
export const GovernanceBodyDecisionItem: React.FC<
    IGovernanceBodyDecisionItemProps
> = (props) => {
    const { isAdvancedGovernance, proposalType } = props;

    const { t } = useTranslations();

    if (!isAdvancedGovernance) {
        return null;
    }

    const decision = proposalType === SppProposalType.VETO ? 'veto' : 'approve';

    return (
        <DefinitionList.Item
            term={t('app.createDao.setupBodyDialog.proposalTypeField.label')}
        >
            {t(
                `app.createDao.setupBodyDialog.proposalTypeField.${decision}.label`,
            )}
            <p className="text-neutral-400 text-sm">
                {t(
                    `app.createDao.setupBodyDialog.proposalTypeField.${decision}.description`,
                )}
            </p>
        </DefinitionList.Item>
    );
};
