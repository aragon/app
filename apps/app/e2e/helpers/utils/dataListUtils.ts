import type { Locator } from '@playwright/test';

/**
 * Root of a clickable DataListItem: the item wrapper that renders the overlay as its direct child,
 * either as a link (`href`) or as a button (`onClick`).
 */
const clickableDataListItem =
    'div:has(> a[aria-labelledby]), div:has(> button[aria-labelledby])';

/** The overlay itself, stretched over the whole item and labelled by the item content. */
const dataListItemOverlay = 'a[aria-labelledby], button[aria-labelledby]';

/**
 * Clicks the DataListItem within `scope` whose content matches `content`.
 *
 * Since gov-ui-kit 2.11.1 (APP-1089) a DataListItem with an `href` or an `onClick` renders that
 * action as an empty absolute overlay named via `aria-labelledby`, with the item content as a
 * sibling marked `pointer-events-none`. Clicking the content therefore always resolves to the
 * overlay intercepting pointer events, so the item is matched by its content and clicked on its
 * overlay.
 *
 * As with `locator.filter({ has })`, `content` is queried starting at the item and not at the
 * document root, so pass it unscoped (`page.getByText(...)`) rather than scoped to `scope`.
 */
export function clickDataListItem(
    scope: Locator,
    content: Locator,
    options?: { timeout?: number },
): Promise<void> {
    return scope
        .locator(clickableDataListItem)
        .filter({ has: content })
        .first()
        .locator(dataListItemOverlay)
        .first()
        .click(options);
}
