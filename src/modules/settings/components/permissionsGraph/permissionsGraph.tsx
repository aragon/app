'use client';

import '@xyflow/react/dist/style.css';
import { CardEmptyState, StateSkeletonBar, Tabs } from '@aragon/gov-ui-kit';
import { ReactFlowProvider } from '@xyflow/react';
import { useMemo, useState } from 'react';
import {
    type Network,
    useAllDaoPermissions,
    useDao,
} from '@/shared/api/daoService';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import type { IPermissionRow } from '../../types';
import { buildPermissionGraph } from '../../utils/buildPermissionGraph';
import { PermissionsGraphCanvas } from './permissionsGraphCanvas';

export interface IPermissionsGraphProps {
    /**
     * ID of the DAO to visualize permissions for.
     */
    daoId: string;
}

interface IPermissionsAccount {
    id: string;
    name: string;
    network: Network;
    daoAddress: string;
}

export const PermissionsGraph: React.FC<IPermissionsGraphProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();
    const { isEnabled } = useFeatureFlags();

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const daoPlugins = useDaoPlugins({ daoId, includeLinkedAccounts: true });

    const accounts = useMemo<IPermissionsAccount[]>(() => {
        if (dao == null) {
            return [];
        }

        const mainAccount: IPermissionsAccount = {
            id: dao.id,
            name: dao.name,
            network: dao.network,
            daoAddress: dao.address,
        };

        const linkedAccounts = dao.linkedAccounts ?? [];
        const showLinkedAccounts =
            isEnabled('linkedAccount') && linkedAccounts.length > 0;

        if (!showLinkedAccounts) {
            return [mainAccount];
        }

        return [
            mainAccount,
            ...linkedAccounts.map((account) => ({
                id: account.id,
                name: account.name,
                network: account.network,
                daoAddress: account.address,
            })),
        ];
    }, [dao, isEnabled]);

    const [selectedAccountId, setSelectedAccountId] = useState<string>();
    const activeAccountId = selectedAccountId ?? accounts[0]?.id;
    const activeAccount =
        accounts.find((account) => account.id === activeAccountId) ??
        accounts[0];

    const { data, isLoading } = useAllDaoPermissions(
        {
            urlParams: {
                network: activeAccount?.network as Network,
                daoAddress: activeAccount?.daoAddress ?? '',
            },
        },
        { enabled: activeAccount != null },
    );

    // NOTE: the optional `condition` field is supplied by the preview mock until
    // APP-953 formalizes it on the permissions response; cast at this boundary.
    const rows = (data ?? []) as IPermissionRow[];

    const graph = useMemo(() => {
        if (dao == null) {
            return { nodes: [], edges: [] };
        }

        return buildPermissionGraph({ rows, dao, daoPlugins });
    }, [rows, dao, daoPlugins]);

    const renderBody = () => {
        if (isLoading || dao == null) {
            return <PermissionsGraphSkeleton />;
        }

        if (graph.nodes.length === 0) {
            return (
                <CardEmptyState
                    description={t(
                        'app.settings.daoPermissionsPage.graphView.empty.description',
                    )}
                    heading={t(
                        'app.settings.daoPermissionsPage.graphView.empty.heading',
                    )}
                    objectIllustration={{ object: 'SETTINGS' }}
                />
            );
        }

        return (
            <div className="relative h-[640px] w-full overflow-hidden rounded-xl border border-neutral-100">
                <ReactFlowProvider key={activeAccountId}>
                    <PermissionsGraphCanvas graph={graph} />
                </ReactFlowProvider>
            </div>
        );
    };

    if (accounts.length <= 1) {
        return renderBody();
    }

    return (
        <Tabs.Root onValueChange={setSelectedAccountId} value={activeAccountId}>
            <Tabs.List>
                {accounts.map((account) => (
                    <Tabs.Trigger
                        key={account.id}
                        label={account.name}
                        value={account.id}
                    />
                ))}
            </Tabs.List>
            {accounts.map((account) => (
                <Tabs.Content key={account.id} value={account.id}>
                    {renderBody()}
                </Tabs.Content>
            ))}
        </Tabs.Root>
    );
};

const PermissionsGraphSkeleton: React.FC = () => (
    <div
        className="flex h-[640px] w-full flex-col gap-4 rounded-xl border border-neutral-100 p-6"
        data-testid="permissions-graph-skeleton"
    >
        <StateSkeletonBar width="40%" />
        <StateSkeletonBar width="70%" />
        <StateSkeletonBar width="55%" />
    </div>
);
