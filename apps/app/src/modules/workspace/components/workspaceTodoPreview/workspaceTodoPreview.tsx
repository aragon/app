'use client';

import {
    AlertInline,
    Button,
    Card,
    CardEmptyState,
    IconType,
} from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import { useWorkspaceTodoListData } from '../../hooks/useWorkspaceTodoListData';
import { workspaceTodoUtils } from '../../utils/workspaceTodoUtils';
import {
    WorkspaceTodoPreviewItem,
    WorkspaceTodoPreviewItemSkeleton,
} from './workspaceTodoPreviewItem';

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

/**
 * Preview of the to-dos of the connected wallet on the workspace overview: the first ones as the compact rows of
 * one card, each with its action, and a link to the to-dos page for the rest. It reads the to-dos and their states
 * from `useWorkspaceTodoListData`, as the to-dos page does.
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
                <Card className="flex flex-col border border-neutral-100">
                    <WorkspaceTodoPreviewItemSkeleton />
                    <WorkspaceTodoPreviewItemSkeleton />
                </Card>
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
                <Card className="flex flex-col border border-neutral-100">
                    {todoList.slice(0, previewSize).map((todo) => (
                        <WorkspaceTodoPreviewItem
                            key={workspaceTodoUtils.getTodoKey(todo)}
                            todo={todo}
                            workspaceId={workspaceId}
                        />
                    ))}
                </Card>
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
