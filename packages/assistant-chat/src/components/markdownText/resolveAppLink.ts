import { canonicalAppOrigin } from '../../copy';

/**
 * Link of an answer on the host the widget runs on: a link to the canonical app origin keeps its
 * path, search and hash under `currentOrigin`; every other href (other hosts, relative, `mailto:`,
 * malformed) is returned as it is.
 */
export const resolveAppLink = (
    href: string | undefined,
    currentOrigin: string | undefined,
): string | undefined => {
    if (
        href == null ||
        currentOrigin == null ||
        currentOrigin === canonicalAppOrigin
    ) {
        return href;
    }

    let url: URL;

    try {
        url = new URL(href);
    } catch {
        return href;
    }

    if (url.origin !== canonicalAppOrigin) {
        return href;
    }

    return `${currentOrigin}${url.pathname}${url.search}${url.hash}`;
};
