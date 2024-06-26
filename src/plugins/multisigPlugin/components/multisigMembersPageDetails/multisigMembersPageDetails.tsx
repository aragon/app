import { useTranslations } from '@/shared/components/translationsProvider';
import { DefinitionList } from '@aragon/ods';

export interface IMultisigMembersPageDetailsProps {}

// TODO: implement full details (APP-3324)
export const MultisigMemberPageDetails: React.FC<IMultisigMembersPageDetailsProps> = () => {
    const { t } = useTranslations();

    return (
        <DefinitionList.Container>
            <DefinitionList.Item term={t('app.plugins.multisig.multisigMembersPageDetails.eligibleMembers')}>
                <p className="text-neutral-500">{t('app.plugins.multisig.multisigMembersPageDetails.members')}</p>
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
