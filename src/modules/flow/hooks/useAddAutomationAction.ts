'use client';

/**
 * Shared "Add automation" action used by the Flow overview page. Reproduces
 * the exact flow kicked off from `daoSettingsPageClient.tsx` so the button on
 * the Flow page lands the user in the same plugin-selection → permission-check
 * → `/create/{plugin}/policy` wizard as the Settings > Automations list.
 *
 * Marked `'use client'` because it transitively pulls in
 * `usePermissionCheckGuard` (which uses `useRef`) — the directive keeps the
 * Flow module barrel importable from the Server Component layout without
 * dragging a client-only hook into the RSC graph.
 *
 * Kept Flow-local for now (the Settings page still inlines the same logic);
 * when we do the next cleanup pass we can migrate Settings to this hook too
 * and retire the duplicate block there.
 */

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { CapitalFlowDialogId } from '@/modules/capitalFlow/constants/capitalFlowDialogId';
import type { ICreateProcessDetailsDialogParams } from '@/modules/createDao/dialogs/createProcessDetailsDialog';
import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { ISelectPluginDialogParams } from '@/modules/governance/dialogs/selectPluginDialog';
import { usePermissionCheckGuard } from '@/modules/governance/hooks/usePermissionCheckGuard';
import { type IDaoPlugin, useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';

export interface IUseAddAutomationActionParams {
    /** DAO identifier used to resolve plugins, DAO metadata, and permission checks. */
    daoId: string;
}

export interface IUseAddAutomationActionResult {
    /**
     * Opens the "Create policy" wizard — the same sequence the Settings page
     * uses: details dialog → (optional) plugin selection → permission check →
     * redirect to `/create/{plugin.address}/policy`. No-op until the DAO
     * metadata has resolved.
     */
    startAddAutomation: () => void;
    /**
     * `true` once the underlying DAO / plugin queries have resolved. Callers
     * can use this to keep the trigger button disabled while we're still
     * waiting on metadata to avoid a click that silently does nothing.
     */
    isReady: boolean;
}

export const useAddAutomationAction = (
    params: IUseAddAutomationActionParams,
): IUseAddAutomationActionResult => {
    const { daoId } = params;
    const router = useRouter();
    const { open } = useDialogContext();

    const { data: dao } = useDao({ urlParams: { id: daoId } });

    // Mirror the settings page: process plugins power both the proposal
    // creation and the permission-guard call below.
    const processPlugins = useDaoPlugins({
        daoId,
        type: PluginType.PROCESS,
        includeLinkedAccounts: true,
    });

    const { check: createProposalGuard } = usePermissionCheckGuard({
        permissionNamespace: 'proposal',
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        plugin: processPlugins?.[0]?.meta,
        daoId,
    });

    const handlePluginSelected = useCallback(
        (plugin: IDaoPlugin) => {
            const url = daoUtils.getDaoUrl(
                dao,
                `create/${plugin.address}/policy`,
            );
            if (url != null) {
                router.push(url);
            }
        },
        [dao, router],
    );

    // Defined as a ref-free recursive closure so the `onError` path (permission
    // denied) can re-open the plugin selection just like the Settings page.
    const handleConfirmCreate = useCallback(() => {
        if (processPlugins == null || processPlugins.length === 0) {
            return;
        }

        const runPluginFlow = (plugin: IDaoPlugin) => {
            createProposalGuard({
                plugin,
                onSuccess: () => handlePluginSelected(plugin),
                // Fall back to the picker on permission-check failure so the
                // user can try a different plugin without restarting the wizard.
                onError: () => handleConfirmCreate(),
            });
        };

        // If there's exactly one process plugin, skip the picker and go
        // straight into the permission-guarded plugin-selection callback —
        // same shortcut the Settings page uses.
        if (processPlugins.length === 1) {
            runPluginFlow(processPlugins[0].meta);
            return;
        }

        const selectParams: ISelectPluginDialogParams = {
            daoId,
            variant: 'process',
            onPluginSelected: runPluginFlow,
        };
        open(GovernanceDialogId.SELECT_PLUGIN, { params: selectParams });
    }, [
        createProposalGuard,
        daoId,
        handlePluginSelected,
        open,
        processPlugins,
    ]);

    const startAddAutomation = useCallback(() => {
        if (dao == null || processPlugins == null) {
            return;
        }
        const detailsParams: ICreateProcessDetailsDialogParams = {
            onActionClick: handleConfirmCreate,
        };
        open(CapitalFlowDialogId.CREATE_POLICY_DETAILS, {
            params: detailsParams,
        });
    }, [dao, handleConfirmCreate, open, processPlugins]);

    const isReady = dao != null && processPlugins != null;

    return { startAddAutomation, isReady };
};
