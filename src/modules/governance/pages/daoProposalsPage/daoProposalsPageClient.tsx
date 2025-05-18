'use client';

import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { DaoPluginInfo } from '@/modules/settings/components/daoPluginInfo';
import { type IDaoPlugin, useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import type { ITabComponentPlugin } from '@/shared/components/pluginTabComponent';
import { daoUtils } from '@/shared/utils/daoUtils';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { IGetProposalListParams } from '../../api/governanceService';
import { DaoProposalList } from '../../components/daoProposalList';
import { GovernanceDialogId } from '../../constants/governanceDialogId';
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
    const router = useRouter();

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const processPlugins = useDaoPlugins({ daoId, type: PluginType.PROCESS })!;

    let defaultPlugin = processPlugins[0];
    if (processPlugins.length > 1) {
        defaultPlugin = {
            id: 'all',
            uniqueId: `all-${daoId}`,
            label: t('app.governance.allProposalsTab.label'),
            meta: {} as IDaoPlugin,
            props: {} as never,
        } as ITabComponentPlugin<IDaoPlugin>;
    }
    const [selectedPlugin, setSelectedPlugin] = useState(defaultPlugin);

    const buildProposalUrl = (plugin: IDaoPlugin): __next_route_internal_types__.DynamicRoutes =>
        daoUtils.getDaoUrl(dao, `create/${plugin.address}/proposal`)!;
    const createProposalUrl = buildProposalUrl(selectedPlugin.meta);

    const handlePermissionGuardSuccess = (plugin?: IDaoPlugin) =>
        router.push(buildProposalUrl(plugin ?? selectedPlugin.meta));

    const { check: createProposalGuard, result: canCreateProposal } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        onSuccess: handlePermissionGuardSuccess,
        plugin: selectedPlugin.meta,
        daoId,
    });

    const handlePluginSelected = (plugin: IDaoPlugin) =>
        createProposalGuard({ plugin, onSuccess: () => handlePermissionGuardSuccess(plugin) });

    const openSelectPluginDialog = () => {
        const initialPlugin = selectedPlugin;
        const params: ISelectPluginDialogParams = { daoId, initialPlugin, onPluginSelected: handlePluginSelected };
        open(GovernanceDialogId.SELECT_PLUGIN, { params });
    };

    const defaultActionProps = {
        onClick: canCreateProposal ? undefined : createProposalGuard,
        href: canCreateProposal ? createProposalUrl : undefined,
    };

    const actionProps = processPlugins.length > 1 ? { onClick: openSelectPluginDialog } : defaultActionProps;

    return (
        <>
            <Page.Main
                title={t('app.governance.daoProposalsPage.main.title')}
                action={{
                    label: t('app.governance.daoProposalsPage.main.action'),
                    ...actionProps,
                }}
            >
                <DaoProposalList.Container
                    initialParams={initialParams}
                    value={selectedPlugin}
                    onValueChange={setSelectedPlugin}
                />
            </Page.Main>
            {selectedPlugin.id !== 'all' && (
                <Page.Aside>
                    <Page.AsideCard title={`${selectedPlugin.label} (${selectedPlugin.meta.slug.toUpperCase()})`}>
                        <DaoPluginInfo
                            plugin={selectedPlugin.meta}
                            daoId={initialParams.queryParams.daoId}
                            type={PluginType.PROCESS}
                        />
                    </Page.AsideCard>
                </Page.Aside>
            )}
        </>
    );
};
