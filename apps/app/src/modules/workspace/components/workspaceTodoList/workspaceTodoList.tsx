'use client';

import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceAccountInfo } from '../../api/workspaceQueryService';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import {
    workspaceAllAccountsSegment,
    workspaceUtils,
} from '../../utils/workspaceUtils';
import { WorkspaceTodoContent } from './workspaceTodoContent';

/**
 * Rows the overview shows before "View all" leads to the to-dos page.
 */
export const workspaceTodoPreviewSize = 3;

export interface IWorkspaceTodoListProps {
    /**
     * Accounts of the workspace.
     */
    accounts: IWorkspaceAccount[];
    /**
     * Accounts as resolved by the accounts API, used to name the Safe of each transaction row.
     */
    accountInfos?: IWorkspaceAccountInfo[];
    /**
     * ID of the workspace, used to link each proposal row to the proposal details page of its account.
     */
    workspaceId: string;
    /**
     * Name of the workspace, named in the section description.
     */
    workspaceName: string;
}

/**
 * "To-dos" section of the workspace overview: a preview of what the connected wallet can still act on across every
 * account of the workspace, the rest being on the to-dos page.
 */
export const WorkspaceTodoList: React.FC<IWorkspaceTodoListProps> = (props) => {
    const { accounts, accountInfos, workspaceId, workspaceName } = props;

    const { t } = useTranslations();

    if (accounts.length === 0) {
        return null;
    }

    // To-dos belong to the wallet, not to an account, so the page is the aggregated one.
    const viewAllHref = workspaceUtils.getAccountScopeUrl(
        workspaceId,
        workspaceAllAccountsSegment,
        'todos',
    );

    return (
        <Page.MainSection
            description={t('app.workspace.workspaceTodoList.description', {
                workspace: workspaceName,
            })}
            title={t('app.workspace.workspaceTodoList.title')}
        >
            <WorkspaceTodoContent
                accountInfos={accountInfos}
                accounts={accounts}
                previewSize={workspaceTodoPreviewSize}
                viewAllHref={viewAllHref}
                workspaceId={workspaceId}
                workspaceName={workspaceName}
            />
        </Page.MainSection>
    );
};
