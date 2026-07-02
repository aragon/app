'use client';

import '@xyflow/react/dist/style.css';
import { CardEmptyState, StateSkeletonBar } from '@aragon/gov-ui-kit';
import { ReactFlowProvider } from '@xyflow/react';
import { useMemo } from 'react';
import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IPermissionRow } from '../../types';
import { buildPermissionGraph } from '../../utils/buildPermissionGraph';
import { PermissionsGraphCanvas } from './permissionsGraphCanvas';

export interface IPermissionsGraphProps {
    /**
     * Permission rows to visualize (the same data the list view consumes).
     */
    rows: IPermissionRow[];
    /**
     * The DAO the permissions belong to, used to classify DAO / linked-DAO nodes.
     */
    dao?: IDao;
    /**
     * Installed DAO plugins used to classify and label plugin nodes.
     */
    daoPlugins?: IFilterComponentPlugin<IDaoPlugin>[];
    /**
     * Whether the permissions are still loading.
     */
    isLoading: boolean;
    /**
     * Active account id — re-fits the canvas when the selected account changes.
     */
    activeAccountId?: string;
}

/**
 * Body of the permissions graph view. Receives already-resolved data from the
 * shared `usePermissionsData` hook so it visualizes exactly what the list shows;
 * the account selector and view toggle live in the page shell.
 */
export const PermissionsGraph: React.FC<IPermissionsGraphProps> = (props) => {
    const { rows, dao, daoPlugins, isLoading, activeAccountId } = props;

    const { t } = useTranslations();

    const graph = useMemo(() => {
        if (dao == null) {
            return { nodes: [], edges: [] };
        }

        return buildPermissionGraph({ rows, dao, daoPlugins });
    }, [rows, dao, daoPlugins]);

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
