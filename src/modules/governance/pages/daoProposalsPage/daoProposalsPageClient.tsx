'use client';

import { DaoPluginInfo } from '@/modules/settings/components/daoPluginInfo';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { useState } from 'react';
import { DaoGovernanceInfo } from '../../../settings/components/daoGovernanceInfo';
import type { IGetProposalListParams } from '../../api/governanceService';
import { DaoProposalList } from '../../components/daoProposalList';
import { GovernanceDialogs } from '../../constants/moduleDialogs';
import type { ISelectPluginDialogParams } from '../../dialogs/selectPluginDialog';

export interface IDaoProposalsPageClientProps {
    /**
     * Initial parameters to use to fetch the DAO proposal list.
     */
    initialParams: IGetProposalListParams;
}

export const DaoProposalsPageClient: React.FC<IDaoProposalsPageClientProps> = (props) => {
    const { initialParams } = props;

    const { daoId } = initialParams.queryParams;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const processPlugins = useDaoPlugins({ daoId, type: PluginType.PROCESS })!;
    const [selectedPlugin, setSelectedPlugin] = useState(processPlugins[0]);

    const buildCreateProposalUrl = (plugin: IDaoPlugin) => `/dao/${daoId}/create/${plugin.address}/proposal`;

    const openSelectPluginDialog = () => {
        const params: ISelectPluginDialogParams = {
            daoId,
            buildSelectedPluginHref: buildCreateProposalUrl,
            defaultPlugin: selectedPlugin,
        };
        open(GovernanceDialogs.SELECT_PLUGIN, { params });
    };

    const actionProps =
        processPlugins.length > 1
            ? { onClick: openSelectPluginDialog }
            : { href: buildCreateProposalUrl(selectedPlugin.meta) };

    return (
        <>
            <Page.Main
                title={t('app.governance.daoProposalsPage.main.title')}
                action={{ label: t('app.governance.daoProposalsPage.main.action'), ...actionProps }}
            >
                <DaoProposalList.Container
                    initialParams={initialParams}
                    value={selectedPlugin}
                    onValueChange={setSelectedPlugin}
                />
            </Page.Main>
            <Page.Aside>
                <Page.Section title={t('app.governance.daoProposalsPage.aside.details.title')} inset={true}>
                    <DaoPluginInfo
                        plugin={selectedPlugin.meta}
                        type={PluginType.PROCESS}
                        daoId={initialParams.queryParams.daoId}
                    />
                </Page.Section>
                <Page.Section title={t('app.governance.daoProposalsPage.aside.settings.title')} inset={false}>
                    <DaoGovernanceInfo daoId={daoId} plugin={selectedPlugin.meta} />
                </Page.Section>
            </Page.Aside>
        </>
    );
};
