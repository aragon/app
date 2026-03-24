import { Link } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import { sanitizeExternalHttpUrl } from '@/shared/security';

export interface IMemberLinksCardProps {
    /** ENS `url` text record. */
    url?: string | null;
    /** ENS `com.twitter` text record. */
    twitter?: string | null;
    /** ENS `com.github` text record. */
    github?: string | null;
}

interface ILinkEntry {
    labelKey: string;
    href: string;
    display: string;
}

const SAFE_HANDLE_RE = /^[\w.-]+$/;

/**
 * Builds a safe X (Twitter) profile URL from a handle.
 * Strips a leading `@` if present and encodes the handle to prevent URL injection.
 */
export function buildTwitterUrl(handle: string): string | null {
    const cleaned = handle.startsWith('@') ? handle.slice(1) : handle;
    if (!SAFE_HANDLE_RE.test(cleaned)) {
        return null;
    }
    return `https://x.com/${encodeURIComponent(cleaned)}`;
}

/**
 * Builds a safe GitHub profile URL from a username.
 * Encodes the handle to prevent URL injection.
 */
export function buildGithubUrl(handle: string): string | null {
    if (!SAFE_HANDLE_RE.test(handle)) {
        return null;
    }
    return `https://github.com/${encodeURIComponent(handle)}`;
}

/**
 * Renders a list of external links (Website, X, GitHub) resolved from ENS text records.
 * Returns `null` when no links are available so the parent can skip rendering the card.
 */
export const MemberLinksCard: React.FC<IMemberLinksCardProps> = (props) => {
    const { url, twitter, github } = props;
    const { t } = useTranslations();

    const links: ILinkEntry[] = [];

    if (url) {
        const safe = sanitizeExternalHttpUrl(url);
        if (safe) {
            links.push({
                labelKey:
                    'app.governance.daoMemberDetailsPage.aside.links.website',
                href: safe,
                display: safe,
            });
        }
    }

    if (twitter) {
        const safe = buildTwitterUrl(twitter);
        if (safe) {
            links.push({
                labelKey:
                    'app.governance.daoMemberDetailsPage.aside.links.twitter',
                href: safe,
                display: safe,
            });
        }
    }

    if (github) {
        const safe = buildGithubUrl(github);
        if (safe) {
            links.push({
                labelKey:
                    'app.governance.daoMemberDetailsPage.aside.links.github',
                href: safe,
                display: safe,
            });
        }
    }

    if (links.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3">
            {links.map((link) => (
                <div className="flex flex-col gap-1" key={link.labelKey}>
                    <Link href={link.href} isExternal={true}>
                        {t(link.labelKey)}
                    </Link>
                    <p className="truncate text-neutral-400 text-sm">
                        {link.display}
                    </p>
                </div>
            ))}
        </div>
    );
};
