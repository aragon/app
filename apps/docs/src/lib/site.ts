// Where the site is published: the Aragon app rewrites /help to this deployment, so every page
// is built under the base path and canonical URLs point at the app's domain.
export const siteOrigin = 'https://app.aragon.org';
export const basePath = '/help';
export const siteUrl = `${siteOrigin}${basePath}`;

// The app this environment's site belongs to (config/.env.*): the header and the footer link to
// it, since the site has its own design and no app navigation.
export const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? siteOrigin;

// The rest of Aragon, linked the way docs.aragon.org does it.
export const developerDocsUrl = 'https://docs.aragon.org';
export const websiteUrl = 'https://aragon.org';
export const privacyPolicyUrl = 'https://aragon.org/privacy-policy';
export const termsOfServiceUrl = 'https://aragon.org/terms-and-conditions';

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

/**
 * Route of the markdown copy of a page, which the build writes next to it (`/accounts/account` →
 * `/accounts/account.md`, a landing page `/accounts` → `/accounts.md`, the home page →
 * `/index.md`). Without the base path, like every route: the Fumadocs page actions prefix it
 * with the base path Next exposes to them (import.meta.env.BASE_URL), both to fetch the copy and
 * to open it.
 */
export const toMarkdownRoute = (route: string): string =>
    route === '/' ? '/index.md' : `${route}.md`;

/**
 * The markdown copy inside the public directory, where the build writes it (`/accounts` →
 * `accounts.md`).
 */
export const toMarkdownFile = (route: string): string =>
    toMarkdownRoute(route).slice(1);

/**
 * Public URL of the markdown copy (`/accounts` → `https://app.aragon.org/help/accounts.md`).
 */
export const toMarkdownUrl = (route: string): string =>
    `${siteUrl}${toMarkdownRoute(route)}`;
