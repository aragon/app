'use client';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DefinitionList, IconType, Link } from '@aragon/ods';
import { useMemberList } from '../../../../modules/governance/api/governanceService';

export interface IMultisigMemberInfoProps {
    /**
     * ID of the DAO
     */
    daoId: string;
    /**
     * Plugin address to display the members for.
     */
    pluginAddress: string;
}

export const MultisigMemberInfo: React.FC<IMultisigMemberInfoProps> = (props) => {
    const { daoId, pluginAddress } = props;
    const { t } = useTranslations();

    const memberParams = { daoId, pluginAddress };
    const { data: memberList } = useMemberList({ queryParams: memberParams });

    const memberCount = memberList?.pages[0].metadata.totalRecords;

    return (
        <DefinitionList.Container>
            <DefinitionList.Item term={t('app.plugins.multisig.multisigMembersInfo.eligibleVoters')}>
                <p className="text-neutral-500">{t('app.plugins.multisig.multisigMembersInfo.multisigMembers')}</p>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.multisig.multisigMembersInfo.membersLabel')}>
                <Link
                    description={t('app.plugins.multisig.multisigMembersInfo.linkDescription')}
                    iconRight={IconType.LINK_EXTERNAL}
                    href={`/dao/${daoId}/members`}
                >
                    {t('app.plugins.multisig.multisigMembersInfo.membersCount', { count: memberCount })}
                </Link>
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
