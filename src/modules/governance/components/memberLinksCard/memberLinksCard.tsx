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
    /** ENS `email` text record. */
    email?: string | null;
    /** ENS `org.telegram` text record. */
    telegram?: string | null;
    /** ENS `com.discord` text record. */
    discord?: string | null;
}

interface ILinkEntry {
    labelKey: string;
    /** External href. Omitted for values without a canonical URL (e.g. Discord). */
    href?: string;
    display: string;
}

const SAFE_HANDLE_RE = /^[\w.-]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
 * Builds a safe Telegram profile URL from a handle.
 * Strips a leading `@` if present and encodes the handle to prevent URL injection.
 */
export function buildTelegramUrl(handle: string): string | null {
    const cleaned = handle.startsWith('@') ? handle.slice(1) : handle;
    if (!SAFE_HANDLE_RE.test(cleaned)) {
        return null;
    }
    return `https://t.me/${encodeURIComponent(cleaned)}`;
}

/**
 * Builds a safe `mailto:` href from an email address.
 * Returns `null` when the value is not a valid email.
 */
export function buildEmailHref(email: string): string | null {
    if (!EMAIL_RE.test(email)) {
        return null;
    }
    return `mailto:${encodeURIComponent(email)}`;
}

const labelPrefix = 'app.governance.daoMemberDetailsPage.aside.links';

/**
 * Resolves the supported ENS profile/contact records into displayable link entries,
 * filtering out missing or malformed values. Shared by the card and its parent so the
 * "Links" card is only shown when at least one entry resolves.
 */
export function buildMemberLinks(props: IMemberLinksCardProps): ILinkEntry[] {
    const { url, twitter, github, email, telegram, discord } = props;
    const links: ILinkEntry[] = [];

    if (url) {
        const safe = sanitizeExternalHttpUrl(url);
        if (safe) {
            links.push({
                labelKey: `${labelPrefix}.website`,
                href: safe,
                display: safe,
            });
        }
    }

    if (twitter) {
        const safe = buildTwitterUrl(twitter);
        if (safe) {
            links.push({
                labelKey: `${labelPrefix}.twitter`,
                href: safe,
                display: safe,
            });
        }
    }

    if (github) {
        const safe = buildGithubUrl(github);
        if (safe) {
            links.push({
                labelKey: `${labelPrefix}.github`,
                href: safe,
                display: safe,
            });
        }
    }

    if (email) {
        const safe = buildEmailHref(email);
        if (safe) {
            links.push({
                labelKey: `${labelPrefix}.email`,
                href: safe,
                display: email,
            });
        }
    }

    if (telegram) {
        const safe = buildTelegramUrl(telegram);
        if (safe) {
            links.push({
                labelKey: `${labelPrefix}.telegram`,
                href: safe,
                display: safe,
            });
        }
    }

    if (discord && SAFE_HANDLE_RE.test(discord)) {
        // Discord usernames have no canonical public profile URL, so render as text.
        links.push({
            labelKey: `${labelPrefix}.discord`,
            display: discord,
        });
    }

    return links;
}

/**
 * Renders a list of external links (Website, X, GitHub, Email, Telegram, Discord)
 * resolved from ENS text records. Returns `null` when no links are available so the
 * parent can skip rendering the card.
 */
export const MemberLinksCard: React.FC<IMemberLinksCardProps> = (props) => {
    const { t } = useTranslations();

    const links = buildMemberLinks(props);

    if (links.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3">
            {links.map((link) => (
                <div className="flex flex-col gap-1" key={link.labelKey}>
                    {link.href ? (
                        <Link href={link.href} isExternal={true}>
                            {t(link.labelKey)}
                        </Link>
                    ) : (
                        <p className="font-normal text-neutral-800">
                            {t(link.labelKey)}
                        </p>
                    )}
                    <p className="truncate text-neutral-400 text-sm">
                        {link.display}
                    </p>
                </div>
            ))}
        </div>
    );
};
