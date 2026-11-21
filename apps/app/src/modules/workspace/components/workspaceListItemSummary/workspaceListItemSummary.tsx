import { type ITagProps, Tag } from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';

export interface IWorkspaceListItemSummaryProps {
    /**
     * Avatar or icon leading the row.
     */
    avatar: ReactNode;
    /**
     * What the row is about. Kept on one line, a longer one being truncated.
     */
    title: ReactNode;
    /**
     * Identifier displayed after the title in a muted tone, e.g. the slug of a proposal. Never truncated.
     */
    identifier?: string;
    /**
     * Line displayed below the title, truncated like it.
     */
    description?: string | null;
    /**
     * Value displayed at the end of the row, e.g. the amount of a transfer.
     */
    value?: string;
    /**
     * Tag displayed at the end of the row, e.g. a status.
     */
    tag?: ITagProps;
}

/**
 * Summary of a row of the workspace lists: an avatar, a title with its identifier, a description, and a value or
 * a tag at the end. It only lays the row out, so the same summary heads an accordion item and fills a data-list
 * item, and the lists of a workspace read alike.
 */
export const WorkspaceListItemSummary: React.FC<
    IWorkspaceListItemSummaryProps
> = (props) => {
    const { avatar, title, identifier, description, value, tag } = props;

    return (
        <div className="flex min-w-0 grow items-center gap-x-related--12-16">
            {avatar}
            <div className="flex min-w-0 grow flex-col items-start gap-y-tight--2-4">
                <div className="flex max-w-full gap-x-tight--fixed-6 text-left leading-tight text-neutral-800 md:text-lg">
                    <span className="truncate">{title}</span>
                    {identifier != null && (
                        <span className="shrink-0 text-neutral-500">
                            {identifier}
                        </span>
                    )}
                </div>
                {description != null && (
                    <p className="max-w-full truncate text-left text-sm leading-tight text-neutral-500 md:text-base">
                        {description}
                    </p>
                )}
            </div>
            {value != null && (
                <span className="shrink-0 truncate leading-tight text-neutral-800 md:text-lg">
                    {value}
                </span>
            )}
            {tag != null && <Tag className="shrink-0" {...tag} />}
        </div>
    );
};
