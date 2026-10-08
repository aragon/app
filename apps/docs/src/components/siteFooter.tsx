import Link from 'fumadocs-core/link';
import {
    appUrl,
    developerDocsUrl,
    privacyPolicyUrl,
    termsOfServiceUrl,
} from '../lib/site';

const links = [
    { text: 'Aragon App', url: appUrl },
    { text: 'Developers', url: developerDocsUrl },
    { text: 'Privacy', url: privacyPolicyUrl },
    { text: 'Terms of Service', url: termsOfServiceUrl },
];

/**
 * The footer of docs.aragon.org, at the end of the page column (the `footer` slot of `DocsPage`,
 * under previous/next): the copyright and the links to the rest of Aragon. It sits inside the
 * layout because anything below it pushes the sticky sidebar up. The year is the build's; the
 * site is rebuilt on every content change.
 */
export const SiteFooter = () => (
    <footer className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 border-neutral-100 border-t pt-6 text-neutral-500 text-sm">
        <span>© Aragon {new Date().getFullYear()}</span>
        {links.map((link) => (
            <Link
                className="transition-colors hover:text-neutral-800"
                href={link.url}
                key={link.url}
            >
                {link.text}
            </Link>
        ))}
    </footer>
);
