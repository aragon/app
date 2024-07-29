'use client';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DefinitionList, IconType, Link } from '@aragon/ods';

export interface IMultisigMemberInfoProps {
    /**
     * Eligible voters (Multisig members | Token holders).
     */
    eligibleVoters: string;
    /**
     * Members count.
     */
    memberCount: number;
}

export const MultisigMemberInfo: React.FC<IMultisigMemberInfoProps> = (props) => {
    const { memberCount, eligibleVoters } = props;
    const { t } = useTranslations();

    const eligibleVotersType =
        eligibleVoters === 'Token Holders'
            ? t('app.plugins.multisig.multisigMembersInfo.tokenHolders')
            : t('app.plugins.multisig.multisigMembersInfo.multisigMembers');
    return (
        <DefinitionList.Container>
            <DefinitionList.Item term={t('app.plugins.multisig.multisigMembersInfo.eligibleVoters')}>
                <p>{eligibleVotersType}</p>
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.plugins.multisig.multisigMembersInfo.members')}>
                <Link
                    description={t('app.plugins.multisig.multisigMembersInfo.linkDescription')}
                    iconRight={IconType.LINK_EXTERNAL}
                    href={'./members'}
                >
                    {t('app.plugins.multisig.multisigMembersInfo.membersCount', { count: memberCount })}
                </Link>
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
