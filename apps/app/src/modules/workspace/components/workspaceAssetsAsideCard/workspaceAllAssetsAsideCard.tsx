'use client';

import { Page } from '@/shared/components/page';
import { StatCard } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceAssetListMetadata } from '../../api/workspaceQueryService';
import { useWorkspaceAssetStats } from './useWorkspaceAssetStats';

export interface IWorkspaceAllAssetsAsideCardProps {
    /**
     * Totals of the selection, as reported by the workspace asset list endpoint.
     */
    metadata?: IWorkspaceAssetListMetadata;
}

/**
 * Stats of the aggregated asset view, displayed on the aside of the workspace assets page.
 *
 * Uses the same `StatCard` grid as the DAO aside cards (`AllAssetsStats`, `DaoInfoAside`), so the two pages read
 * alike. Accounts of any type contribute to it, since they are all read from the same workspace endpoint.
 */
export const WorkspaceAllAssetsAsideCard: React.FC<
    IWorkspaceAllAssetsAsideCardProps
> = (props) => {
    const { metadata } = props;

    const { t } = useTranslations();

    const stats = useWorkspaceAssetStats(metadata);

    return (
        <Page.AsideCard
            title={t('app.workspace.workspaceAllAssetsAsideCard.allAssets')}
        >
            <div className="grid w-full grid-cols-2 gap-3">
                {stats.map((stat) => (
                    <StatCard
                        key={stat.label}
                        label={stat.label}
                        value={stat.value}
                    />
                ))}
            </div>
        </Page.AsideCard>
    );
};
