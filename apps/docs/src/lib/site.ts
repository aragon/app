// Where the site is published: the Aragon app rewrites /help to this deployment, so every page
// is built under the base path and canonical URLs point at the app's domain.
export const siteOrigin = 'https://app.aragon.org';
export const basePath = '/help';
export const siteUrl = `${siteOrigin}${basePath}`;

export const siteTitle = 'Aragon Platform';
export const siteDescription =
    'How the Aragon platform works: accounts, governance processes, treasury, and access control.';

export const draftNotice =
    'This page is a draft: the Aragon team is still reviewing it.';

/**
 * Public URL of a site route (`/accounts/account` → `https://app.aragon.org/help/accounts/account`).
 */
export const toCanonicalUrl = (route: string): string =>
    route === '/' ? siteUrl : `${siteUrl}${route}`;
