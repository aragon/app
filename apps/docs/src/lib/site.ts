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
 * Path of the markdown copy of a page, which the build writes next to it (`/accounts/account` →
 * `/help/accounts/account.md`, the home page → `/help/index.md`): what the page actions copy and
 * hand to an assistant.
 */
export const toMarkdownPath = (route: string): string =>
    route === '/' ? `${basePath}/index.md` : `${basePath}${route}.md`;
