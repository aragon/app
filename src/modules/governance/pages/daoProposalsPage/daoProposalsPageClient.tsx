'use client';

import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { useState } from 'react';
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

    const { t } = useTranslations();

    const processPlugins = useDaoPlugins({ daoId: initialParams.queryParams.daoId, type: PluginType.PROCESS })!;
    const [selectedPlugin, setSelectedPlugin] = useState(processPlugins[0]);

    return (
        <>
            <Page.Main
                title={t('app.governance.daoProposalsPage.main.title')}
                action={{
                    label: t('app.governance.daoProposalsPage.main.action'),
                    href: `/dao/${initialParams.queryParams.daoId}/create/proposal`,
                }}
            >
                <DaoProposalList
                    initialParams={initialParams}
                    value={selectedPlugin}
                    onValueChange={setSelectedPlugin}
                />
            </Page.Main>
            <Page.Aside>
                <Page.Section title={t('app.governance.daoProposalsPage.aside.details.title')} inset={false}>
                    <DaoGovernanceInfo daoId={initialParams.queryParams.daoId} plugin={selectedPlugin.meta} />
                </Page.Section>
            </Page.Aside>
        </>
    );
};
