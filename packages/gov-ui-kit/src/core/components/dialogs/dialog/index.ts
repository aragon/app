import { DialogContent } from './dialogContent';
import { DialogFooter } from './dialogFooter';
import { DialogHeader } from './dialogHeader';
import { DialogRoot } from './dialogRoot';

/**
 * Usage notes:
 *
 * - `Dialog.Header` accepts a string `title` and optional string `description`; neither prop accepts arbitrary
 *   React elements.
 * - `Dialog.Content` adds horizontal inset padding by default; pass `noInset` when the content needs to reach the
 *   dialog edges.
 */
export const Dialog = {
    Content: DialogContent,
    Footer: DialogFooter,
    Header: DialogHeader,
    Root: DialogRoot,
};

export * from './dialogContent';
export * from './dialogFooter';
export * from './dialogHeader';
export * from './dialogRoot';
