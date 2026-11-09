import {
    Button,
    StateSkeletonBar,
    StateSkeletonCircular,
} from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';

export interface IWorkspaceTodoItemAction {
    /**
     * Label of the action button.
     */
    label: string;
    /**
     * A primary action is a vote, a secondary one a signature, as the to-do list of the dashboard draws them.
     */
    variant: 'primary' | 'secondary';
    /**
     * Page the action takes place on. The button navigates when set, and calls `onClick` otherwise.
     */
    href?: string;
    /**
     * Opens the action in place, for a Safe transaction reviewed and signed in a dialog.
     */
    onClick?: () => void;
}

export interface IWorkspaceTodoItemProps {
    /**
     * Avatar of the account the row belongs to.
     */
    avatar: ReactNode;
    /**
     * What is waiting: the proposal or the transaction.
     */
    title: string;
    /**
     * What to do about it and until when.
     */
    meta: string;
    /**
     * The action to take.
     */
    action: IWorkspaceTodoItemAction;
}

const rowClassName =
    'flex items-center gap-4 border-neutral-100 border-t px-4 py-3 first:border-t-0 md:px-6 md:py-4';

/**
 * One row of the to-do list: the account's avatar, what is waiting, what to do about it, and the action itself.
 */
export const WorkspaceTodoItem: React.FC<IWorkspaceTodoItemProps> = (props) => {
    const { avatar, title, meta, action } = props;

    const buttonProps = { className: 'shrink-0', size: 'sm' as const };

    return (
        <div className={rowClassName}>
            {avatar}
            <div className="flex min-w-0 grow flex-col gap-1">
                <p className="truncate text-base text-neutral-800 leading-tight">
                    {title}
                </p>
                <p className="truncate text-neutral-500 text-sm leading-tight">
                    {meta}
                </p>
            </div>
            {action.href != null ? (
                <Button
                    {...buttonProps}
                    href={action.href}
                    variant={action.variant}
                >
                    {action.label}
                </Button>
            ) : (
                <Button
                    {...buttonProps}
                    onClick={action.onClick}
                    variant={action.variant}
                >
                    {action.label}
                </Button>
            )}
        </div>
    );
};

/**
 * Placeholder of a row while the list loads.
 */
export const WorkspaceTodoItemSkeleton: React.FC = () => (
    <div className={rowClassName}>
        <StateSkeletonCircular size="md" />
        <div className="flex grow flex-col gap-2">
            <StateSkeletonBar size="lg" width="60%" />
            <StateSkeletonBar size="md" width="40%" />
        </div>
        <StateSkeletonBar size="xl" width={72} />
    </div>
);
