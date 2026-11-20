import { basePath, siteOrigin } from './site';

export interface IAppRelativeLink {
    /**
     * Host-relative link, with a single leading slash.
     */
    href: string;
    /**
     * Whether the link is a page of the site itself (under the base path), which every host that
     * serves the site answers; the rest is a page of the app.
     */
    isSite: boolean;
}

/**
 * Host-relative form of an absolute link to the app's origin (`https://app.aragon.org/create?x=1#y`
 * → `/create?x=1#y`), so a reader stays on the host that serves the site. Other hosts and anything
 * that is not an absolute URL give `null`.
 */
export const toAppRelativeLink = (
    href: string | undefined,
): IAppRelativeLink | null => {
    if (href == null) {
        return null;
    }

    let url: URL;

    try {
        url = new URL(href);
    } catch {
        return null;
    }

    if (url.origin !== siteOrigin) {
        return null;
    }

    // Extra leading slashes would make the link protocol-relative, a link to another host.
    const pathname = url.pathname.replace(/^\/+/, '/');
    const isSite = pathname === basePath || pathname.startsWith(`${basePath}/`);

    return { href: `${pathname}${url.search}${url.hash}`, isSite };
};

/**
 * Origin to put before a host-relative app link: empty (stay on the current host) when the site is
 * served by one of the apps or the host is unknown, the first app origin when it is opened on any
 * other host, such as a docs deployment.
 */
export const resolveAppOrigin = (
    currentOrigin: string | undefined,
    appOrigins: string[],
): string => {
    if (
        currentOrigin == null ||
        appOrigins.length === 0 ||
        appOrigins.includes(currentOrigin)
    ) {
        return '';
    }

    return appOrigins[0];
};
