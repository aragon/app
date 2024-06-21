import { useTranslations } from '@/shared/components/translationsProvider';
import { DefinitionList } from '@aragon/ods';

export interface ITokenMembersPageDetailsProps {}

export const TokenMembersPageDetails: React.FC<ITokenMembersPageDetailsProps> = () => {
    const { t } = useTranslations();

    return (
        <DefinitionList.Container>
            <DefinitionList.Item term={t('app.plugins.token.membersPageDetails.eligibleMembers')}>
                <p className="text-neutral-500">{t('app.plugins.token.membersPageDetails.members')}</p>
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
