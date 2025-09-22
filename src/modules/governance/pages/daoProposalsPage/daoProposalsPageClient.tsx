'use client';

import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { DaoPluginInfo } from '@/modules/settings/components/daoPluginInfo';
import { type IDaoPlugin, useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginFilterUrlParam } from '@/shared/hooks/useDaoPluginFilterUrlParam';
import { pluginGroupFilter } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { invariant } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import type { IGetProposalListParams } from '../../api/governanceService';
import { DaoProposalList } from '../../components/daoProposalList';
import { ProposalListStats } from '../../components/proposalListStats';
import { GovernanceDialogId } from '../../constants/governanceDialogId';
import type { ISelectPluginDialogParams } from '../../dialogs/selectPluginDialog';

export interface IDaoProposalsPageClientProps {
    /**
     * Initial parameters to use to fetch the DAO proposal list.
     */
    initialParams: IGetProposalListParams;
}

export const daoProposalsPageFilterParam = 'proposals';

export const DaoProposalsPageClient: React.FC<IDaoProposalsPageClientProps> = (props) => {
    const { initialParams } = props;
    const { daoId } = initialParams.queryParams;

    const { t } = useTranslations();
    const { open } = useDialogContext();
    const router = useRouter();

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const { activePlugin, setActivePlugin, plugins } = useDaoPluginFilterUrlParam({
        daoId,
        type: PluginType.PROCESS,
        includeGroupFilter: true,
        name: daoProposalsPageFilterParam,
    });

    invariant(activePlugin != null, 'DaoProposalsPageClient: no valid plugin found.');

    const buildProposalUrl = (plugin: IDaoPlugin) => daoUtils.getDaoUrl(dao, `create/${plugin.address}/proposal`)!;

    const handlePermissionGuardSuccess = (plugin?: IDaoPlugin) =>
        router.push(buildProposalUrl(plugin ?? activePlugin.meta));

    const { check: createProposalGuard, result: canCreateProposal } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        onSuccess: handlePermissionGuardSuccess,
        plugin: activePlugin.meta,
        daoId,
    });

    const handlePluginSelected = (plugin: IDaoPlugin) =>
        createProposalGuard({ plugin, onSuccess: () => handlePermissionGuardSuccess(plugin) });

    const openSelectPluginDialog = () => {
        const initialPlugin = activePlugin.id === pluginGroupFilter.id ? undefined : activePlugin;
        const params: ISelectPluginDialogParams = { daoId, initialPlugin, onPluginSelected: handlePluginSelected };
        open(GovernanceDialogId.SELECT_PLUGIN, { params });
    };

    const defaultActionProps = {
        onClick: canCreateProposal ? undefined : createProposalGuard,
        href: canCreateProposal ? buildProposalUrl(activePlugin.meta) : undefined,
    };

    const actionProps = plugins && plugins.length > 1 ? { onClick: openSelectPluginDialog } : defaultActionProps;

    const allProposalsSelected = activePlugin.uniqueId === pluginGroupFilter.uniqueId;
    const asideCardTitle = allProposalsSelected
        ? t('app.governance.daoProposalsPage.aside.stats')
        : `${activePlugin.label} (${activePlugin.meta.slug.toUpperCase()})`;

    return (
        <>
            <Page.Main
                title={t('app.governance.daoProposalsPage.main.title')}
                action={{
                    label: t('app.governance.daoProposalsPage.main.action'),
                    ...actionProps,
                }}
            >
                <DaoProposalList initialParams={initialParams} value={activePlugin} onValueChange={setActivePlugin} />
            </Page.Main>
            <Page.Aside>
                <Page.AsideCard title={asideCardTitle}>
                    {allProposalsSelected && <ProposalListStats initialParams={initialParams} dao={dao!} />}
                    {!allProposalsSelected && (
                        <DaoPluginInfo plugin={activePlugin.meta} daoId={daoId} type={PluginType.PROCESS} />
                    )}
                </Page.AsideCard>
            </Page.Aside>
        </>
    );
};
