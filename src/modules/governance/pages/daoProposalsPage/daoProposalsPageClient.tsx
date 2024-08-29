'use client';

import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useRouter } from 'next/navigation';
import { DaoGovernanceInfo } from '../../../settings/components/daoGovernanceInfo';
import type { IGetProposalListParams } from '../../api/governanceService';
import { DaoProposalList } from '../../components/daoProposalList';

export interface IDaoProposalsPageClientProps {
    /**
     * Initial parameters to use to fetch the DAO proposal list.
     */
    initialParams: IGetProposalListParams;
}

export const DaoProposalsPageClient: React.FC<IDaoProposalsPageClientProps> = (props) => {
    const { initialParams } = props;

    const router = useRouter();

    const { t } = useTranslations();

    return (
        <>
            <Page.Main
                title={t('app.governance.daoProposalsPage.main.title')}
                action={{
                    label: 'Proposal',
                    onClick: () => router.push(`/dao/${initialParams.queryParams.daoId}/create/proposal`),
                }}
            >
                <DaoProposalList initialParams={initialParams} />
            </Page.Main>
            <Page.Aside>
                <Page.Section title={t('app.governance.daoProposalsPage.aside.details.title')} inset={false}>
                    <DaoGovernanceInfo daoId={initialParams.queryParams.daoId} />
                </Page.Section>
            </Page.Aside>
        </>
    );
};
