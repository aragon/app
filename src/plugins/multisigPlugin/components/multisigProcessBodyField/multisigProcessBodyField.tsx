import type { ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DefinitionList, type ICompositeAddress } from '@aragon/gov-ui-kit';
import type { IMultisigSetupGovernanceForm } from '../multisigSetupGovernance';
import type { IMultisigSetupMembershipForm } from '../multisigSetupMembership';

export interface IMultisigProcessBodyFieldProps {
    /**
     * The body to display the details for.
     */
    body: ISetupBodyForm<IMultisigSetupGovernanceForm, ICompositeAddress, IMultisigSetupMembershipForm>;
}

export const MultisigProcessBodyField = (props: IMultisigProcessBodyFieldProps) => {
    const { body } = props;

    const { t } = useTranslations();

    const { membership, governance } = body;
    const membersCount = membership.members.length;
    const { minApprovals } = governance;

    const baseTranslationKey = 'app.plugins.multisig.multisigProcessBodyField';

    return (
        <DefinitionList.Container className="w-full">
            <DefinitionList.Item term={t(`${baseTranslationKey}.membersTerm`)}>
                {t(`${baseTranslationKey}.membersDefinition`, { count: membersCount })}
            </DefinitionList.Item>
            <DefinitionList.Item term={t(`${baseTranslationKey}.thresholdTerm`)}>
                {t(`${baseTranslationKey}.thresholdDefinition`, {
                    threshold: minApprovals,
                    count: membersCount,
                })}
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
