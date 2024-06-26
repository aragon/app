import { useTranslations } from '@/shared/components/translationsProvider';
import { DefinitionList } from '@aragon/ods';

export interface ITokenMembersPageDetailsProps {}

// TODO: implement full details (APP-3324)
export const TokenMembersPageDetails: React.FC<ITokenMembersPageDetailsProps> = () => {
    const { t } = useTranslations();

    return (
        <DefinitionList.Container>
            <DefinitionList.Item term={t('app.plugins.token.tokenMembersPageDetails.eligibleMembers')}>
                <p className="text-neutral-500">{t('app.plugins.token.tokenMembersPageDetails.members')}</p>
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
