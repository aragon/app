import type { TagVariant } from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';

export interface IProposalDetailsAsideProps {
    /**
     * Human-readable proposal ID shown in the ID row.
     */
    id: string;
    /**
     * Value copied from the ID row. Omit to render the ID without a copy affordance.
     */
    idCopyValue?: string;
    /**
     * Onchain / incremental identifier. The row is omitted when undefined.
     */
    onChainId?: string;
    /**
     * Proposer address. The creator row is omitted when undefined (e.g. an unknown Safe proposer).
     */
    creatorAddress?: string;
    /**
     * Resolved ENS name for the proposer, when available.
     */
    creatorEnsName?: string | null;
    /**
     * Onchain explorer link for the proposer address.
     */
    creatorLink?: string;
    /**
     * Formatted publication date.
     */
    publishedDate: string | null;
    /**
     * Onchain explorer link for the publication date, when the date maps to a transaction.
     */
    publishedLink?: string;
    /**
     * Standard proposal status tag label.
     */
    statusLabel: string;
    /**
     * Standard proposal status tag variant.
     */
    statusVariant: TagVariant;
    /**
     * Extra `DefinitionList.Item` rows appended after the status row (e.g. a settled execution date).
     */
    children?: ReactNode;
}
