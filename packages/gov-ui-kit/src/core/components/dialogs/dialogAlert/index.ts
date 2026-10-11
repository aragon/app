import { DialogAlertContent } from './dialogAlertContent';
import { DialogAlertFooter } from './dialogAlertFooter';
import { DialogAlertHeader } from './dialogAlertHeader';
import { DialogAlertRoot } from './dialogAlertRoot';

/**
 * Usage notes:
 *
 * - `DialogAlert.Header` and `DialogAlert.Footer` require the `DialogAlert.Root` provider; using either outside the
 *   matching Root throws, while `DialogAlert.Content` does not consume that custom context.
 * - `DialogAlert.Header` accepts a string `title`, not an arbitrary React element; use the component's other
 *   regions for custom content.
 */
export const DialogAlert = {
    Content: DialogAlertContent,
    Footer: DialogAlertFooter,
    Header: DialogAlertHeader,
    Root: DialogAlertRoot,
};

export * from './dialogAlertContent';
export * from './dialogAlertFooter';
export * from './dialogAlertHeader';
export * from './dialogAlertRoot';
