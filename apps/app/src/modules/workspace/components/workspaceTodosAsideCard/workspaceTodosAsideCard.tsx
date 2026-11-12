'use client';

import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { Page } from '@/shared/components/page';
import { StatCard } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import {
    useWorkspaceTodoData,
    WorkspaceTodoType,
} from '../../hooks/useWorkspaceTodoData';

export interface IWorkspaceTodosAsideCardProps {
    /**
     * Accounts the stats cover, i.e. the selection displayed by the list next to the card.
     */
    accounts: IWorkspaceAccount[];
    /**
     * Title of the card, defaulting to the generic aggregated-view title. Set to the account a page is scoped to.
     */
    title?: string;
}

/**
 * Stats of the to-dos of the connected wallet, displayed on the aside of the workspace to-dos page: how many
 * proposals wait for its vote and how many Safe transactions for its signature.
 *
 * The to-dos are read under the same query as the list next to the card, so the card adds no request. To-dos belong
 * to the wallet, so without one there is nothing to count and the card is not rendered.
 */
export const WorkspaceTodosAsideCard: React.FC<
    IWorkspaceTodosAsideCardProps
> = (props) => {
    const { accounts, title } = props;

    const { t } = useTranslations();
    const { address } = useWalletAccount();

    const { todos, isPending, isError } = useWorkspaceTodoData({
        accounts,
        address,
    });

    if (address == null) {
        return null;
    }

    // A count that could not be read is not a zero.
    const formatCount = (type: WorkspaceTodoType) =>
        isPending || isError
            ? '-'
            : todos.filter((todo) => todo.type === type).length.toString();

    const stats = [
        {
            label: t('app.workspace.workspaceTodosAsideCard.proposals'),
            value: formatCount(WorkspaceTodoType.PROPOSAL),
        },
        {
            label: t('app.workspace.workspaceTodosAsideCard.transactions'),
            value: formatCount(WorkspaceTodoType.TRANSACTION),
        },
    ];

    return (
        <Page.AsideCard
            title={title ?? t('app.workspace.workspaceTodosAsideCard.allTodos')}
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
