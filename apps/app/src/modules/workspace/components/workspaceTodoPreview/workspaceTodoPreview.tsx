'use client';

import {
    AlertInline,
    Button,
    CardEmptyState,
    IconType,
} from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import { useWorkspaceTodoListData } from '../../hooks/useWorkspaceTodoListData';
import { workspaceTodoUtils } from '../../utils/workspaceTodoUtils';
import {
    WorkspaceTodoListItem,
    WorkspaceTodoListItemSkeleton,
} from '../workspaceTodoList';

export interface IWorkspaceTodoPreviewProps {
    /**
     * Accounts to read the to-dos of.
     */
    accounts: IWorkspaceAccount[];
    /**
     * ID of the workspace, which the rows link into.
     */
    workspaceId: string;
    /**
     * Number of to-dos displayed before the rest is left to `viewAllHref`.
     */
    previewSize: number;
    /**
     * Page listing every to-do, linked below a preview that left some out.
     */
    viewAllHref: string;
}

const listClassName = 'flex flex-col gap-3 md:gap-2';

/**
 * Preview of the to-dos of the connected wallet on the workspace overview: the first ones, as the rows the to-dos
 * page lists, and a link to that page for the rest. It reads the to-dos and their states from
 * `useWorkspaceTodoListData`, as the to-dos page does.
 */
export const WorkspaceTodoPreview: React.FC<IWorkspaceTodoPreviewProps> = (
    props,
) => {
    const { accounts, workspaceId, previewSize, viewAllHref } = props;

    const { t } = useTranslations();

    const { todoList, state, emptyState, errorState, partialMessage } =
        useWorkspaceTodoListData({ accounts });

    const renderContent = () => {
        if (state === 'initialLoading') {
            return (
                <div className={listClassName}>
                    <WorkspaceTodoListItemSkeleton />
                    <WorkspaceTodoListItemSkeleton />
                </div>
            );
        }

        if (state === 'error') {
            return <CardEmptyState {...errorState} />;
        }

        if (todoList.length === 0) {
            return <CardEmptyState {...emptyState} />;
        }

        return (
            <>
                <div className={listClassName}>
                    {todoList.slice(0, previewSize).map((todo) => (
                        <WorkspaceTodoListItem
                            key={workspaceTodoUtils.getTodoKey(todo)}
                            todo={todo}
                            workspaceId={workspaceId}
                        />
                    ))}
                </div>
                {todoList.length > previewSize && (
                    <Button
                        className="self-start"
                        href={viewAllHref}
                        iconRight={IconType.CHEVRON_RIGHT}
                        size="md"
                        variant="tertiary"
                    >
                        {t('app.workspace.workspaceTodoPreview.viewAll')}
                    </Button>
                )}
            </>
        );
    };

    return (
        <>
            {partialMessage != null && (
                <AlertInline message={partialMessage} variant="warning" />
            )}
            {renderContent()}
        </>
    );
};
