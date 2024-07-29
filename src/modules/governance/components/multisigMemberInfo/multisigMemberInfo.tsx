'use client';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DefinitionList, IconType, Link } from '@aragon/ods';
import { useMemberList } from '../../api/governanceService';

export interface IMultisigMemberInfoProps {
    /**
     * ID of the DAO
     */
    daoId: string;
}

export const MultisigMemberInfo: React.FC<IMultisigMemberInfoProps> = (props) => {
    const { daoId } = props;
    const { t } = useTranslations();
    const daoSettingsParams = { daoId };

    const { data: memberList } = useMemberList({ queryParams: daoSettingsParams });

    const memberCount = memberList?.pages[0].metadata.totalRecords;

    return (
        <DefinitionList.Container>
            <DefinitionList.Item term={t('app.plugins.multisig.multisigMembersInfo.eligibleVoters')}>
                <p>{t('app.plugins.multisig.multisigMembersInfo.multisigMembers')}</p>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.multisig.multisigMembersInfo.members')}>
                <Link
                    description={t('app.plugins.multisig.multisigMembersInfo.linkDescription')}
                    iconRight={IconType.LINK_EXTERNAL}
                    href="./members"
                >
                    {t('app.plugins.multisig.multisigMembersInfo.membersCount', { count: memberCount })}
                </Link>
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
