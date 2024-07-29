'use client';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DefinitionList, IconType, Link } from '@aragon/ods';
import { useMemberList } from '../../api/governanceService';
import { useDaoSettings } from '@/shared/api/daoService';
import type { IDaoMultisigSettings } from '@/plugins/multisigPlugin/types';

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
    const { data: currentSettings } = useDaoSettings<IDaoMultisigSettings>({ urlParams: daoSettingsParams });

    const memberCount = memberList?.pages[0].metadata.totalRecords;

    const eligibleVotersType = currentSettings?.settings.onlyListed
        ? t('app.plugins.multisig.multisigMembersInfo.multisigMembers')
        : t('app.plugins.multisig.multisigMembersInfo.tokenHolders');

    return (
        <DefinitionList.Container>
            <DefinitionList.Item term={t('app.plugins.multisig.multisigMembersInfo.eligibleVoters')}>
                <p>{eligibleVotersType}</p>
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
