'use client';

import { Toggle, ToggleGroup } from '@aragon/gov-ui-kit';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFilterUrlParam } from '@/shared/hooks/useFilterUrlParam';
import { useWorkspaceAccounts } from '../../api/workspaceQueryService';
import { useWorkspace } from '../../api/workspaceService';
import {
    WorkspaceTodoContent,
    WorkspaceTodoFilter,
} from '../../components/workspaceTodoList';
import { useWorkspaceAccountOptions } from '../../hooks/useWorkspaceAccountOptions';

export interface IWorkspaceTodosPageClientProps {
    /**
     * ID of the workspace.
     */
    workspaceId: string;
}

/**
 * URL parameter holding the kind of to-dos displayed, so a filtered page can be shared and survives a reload.
 */
export const workspaceTodosFilterParam = 'todotype';

const filters = Object.values(WorkspaceTodoFilter);

/**
 * To-dos of the connected wallet, scoped to the account on the route: every account of the workspace, or just the one
 * named. The rows are the ones of the overview section, unfolded, with a filter on their kind.
 */
export const WorkspaceTodosPageClient: React.FC<
    IWorkspaceTodosPageClientProps
> = (props) => {
    const { workspaceId } = props;

    const { t } = useTranslations();

    // Every account of the workspace, or just the one the route names, held by the workspace or not.
    const { scopedAccounts, isPending: isScopePending } =
        useWorkspaceAccountOptions();

    const { data: workspace } = useWorkspace({
        urlParams: { id: workspaceId },
    });

    // Resolved to name the Safe of each transaction row, which the registry does not store.
    const { data: accountInfos } = useWorkspaceAccounts(
        {
            body: {
                accounts: scopedAccounts.map(({ network, address }) => ({
                    network,
                    address,
                })),
            },
        },
        { enabled: scopedAccounts.length > 0 },
    );

    const [activeFilter, setActiveFilter] = useFilterUrlParam({
        name: workspaceTodosFilterParam,
        fallbackValue: WorkspaceTodoFilter.ALL,
        validValues: filters,
    });

    return (
        <Page.Content>
            <Page.Main title={t('app.workspace.workspaceTodosPage.main.title')}>
                <ToggleGroup
                    isMultiSelect={false}
                    onChange={(value) => {
                        if (typeof value === 'string') {
                            setActiveFilter(value);
                        }
                    }}
                    value={activeFilter}
                >
                    {filters.map((filter) => (
                        <Toggle
                            key={filter}
                            label={t(
                                `app.workspace.workspaceTodosPage.filter.${filter}`,
                            )}
                            value={filter}
                        />
                    ))}
                </ToggleGroup>
                <WorkspaceTodoContent
                    accountInfos={accountInfos}
                    accounts={scopedAccounts}
                    filter={activeFilter as WorkspaceTodoFilter}
                    isAccountsPending={isScopePending}
                    workspaceId={workspaceId}
                    workspaceName={workspace?.name ?? ''}
                />
            </Page.Main>
        </Page.Content>
    );
};
