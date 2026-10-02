'use client';

import { DaoFilterAsideCard } from '@/modules/finance/components/daoFilterAsideCard';
import { useDao } from '@/shared/api/daoService';
import type { IDaoFilterOption } from '@/shared/hooks/useDaoFilterUrlParam';
import type { IWorkspaceAssetListMetadata } from '../../api/workspaceQueryService';
import type { IWorkspaceAccount } from '../../api/workspaceService';

export interface IWorkspaceDaoAssetsAsideCardProps {
    /**
     * DAO account selected on the page.
     */
    account: IWorkspaceAccount;
    /**
     * Label of the account, used as the title of the card.
     */
    label: string;
    /**
     * Totals of the selection, as reported by the workspace asset list endpoint.
     */
    metadata?: IWorkspaceAssetListMetadata;
}

/**
 * Assets aside card of a DAO account of a workspace, rendering the same card as the DAO assets page.
 *
 * The workspace exposes one option per account and no aggregation of a DAO with its linked accounts, so the card is
 * always given the parent-DAO option of that single DAO.
 */
export const WorkspaceDaoAssetsAsideCard: React.FC<
    IWorkspaceDaoAssetsAsideCardProps
> = (props) => {
    const { account, label, metadata } = props;

    // A workspace account ID is already the DAO ID, so this shares its key with the DAO pages' own query.
    const { data: dao } = useDao({ urlParams: { id: account.id } });

    if (dao == null) {
        return null;
    }

    const activeOption: IDaoFilterOption = {
        id: dao.id,
        label,
        daoId: dao.id,
        isAll: false,
        isParent: true,
    };

    // The card only reads the totals out of the page, the rows next to it are rendered by the list itself.
    const selectedMetadata =
        metadata != null ? { metadata, data: [] } : undefined;

    return (
        <DaoFilterAsideCard
            activeOption={activeOption}
            dao={dao}
            selectedMetadata={selectedMetadata}
            statsType="assets"
        />
    );
};
