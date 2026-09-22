'use client';

import { Link, Tag } from '@aragon/gov-ui-kit';
import { useProposalBySlug } from '@/modules/governance/api/governanceService';
import { proposalUtils } from '@/modules/governance/utils/proposalUtils';
import { useDao } from '@/shared/api/daoService';
import {
    type IAragonProposalReport,
    isAragonProposalReport,
} from '@/shared/api/safeService';
import { useTranslations } from '@/shared/components/translationsProvider';

// Shared with the item so the resolved title and the unresolved fallback read as the same heading.
const titleClassName =
    'truncate text-base text-neutral-800 leading-tight md:text-lg';

// Stretches the card's single anchor over the whole `DataListItem` (which is `relative`), so the
// entire row navigates while the Review button, a later positioned sibling, stays clickable above
// it. Only ever one stretched anchor per card, so the overlays never compete.
const stretchClassName = "after:absolute after:inset-0 after:content-['']";

export interface ISafeProposalReportLinkProps {
    /**
     * Proposal this transaction's calldata reports to.
     */
    report: IAragonProposalReport;
    /**
     * Whether this is the row's only association, in which case its link (or the Safe fallback when
     * it does not resolve) stretches over the whole card.
     */
    stretch?: boolean;
    /**
     * Safe app transaction URL, used as the whole-card destination when the report does not resolve
     * to an Aragon proposal.
     */
    fallbackHref?: string;
}

/**
 * The whole-card destination for a transaction with no resolved Aragon association: the Safe app,
 * where an owner actually reviews and signs. Renders as plain text on a network the Safe app does
 * not cover, where there is no route out.
 */
export const SafeTransactionCardLink: React.FC<{ href?: string }> = ({
    href,
}) => {
    const { t } = useTranslations();
    const label = t('app.safe.safePendingTransactionList.item.transaction');

    if (href == null) {
        return <span className={titleClassName}>{label}</span>;
    }

    return (
        <Link
            className={stretchClassName}
            href={href}
            isExternal={true}
            showUrl={false}
            textClassName={titleClassName}
        >
            {label}
        </Link>
    );
};

/**
 * Resolves one report to its Aragon proposal and renders it as an identifier tag plus the proposal
 * title, the whole pair linking to the proposal.
 *
 * One component per report rather than one per row: entries can span different DAOs, so each needs
 * its own `useDao`. Rows reporting to the same DAO share a single request through the query cache.
 *
 * Falls back to the Safe app card link when the entry is malformed, or when the DAO or its plugin
 * does not resolve - `getProposalUrl` returns undefined for an uninstalled or unsupported plugin,
 * and a dead link is worse than the Safe destination. Only the row's single association falls back;
 * an unresolved extra in a multi-association row renders nothing rather than a second Safe link.
 */
export const SafeProposalReportLink: React.FC<ISafeProposalReportLinkProps> = ({
    report,
    stretch = false,
    fallbackHref,
}) => {
    // Validated here rather than in the queue response guard: that guard gates the whole paginated
    // response, so rejecting a malformed entry there would drop every row - losing the signing
    // surface to protect a link. Here a bad entry costs only itself.
    const isValid = isAragonProposalReport(report);
    const proposalParams = {
        incrementalId: report.proposalId,
        pluginAddress: report.bodyId,
    };

    const { data: dao } = useDao(
        { urlParams: { id: report.daoId } },
        { enabled: isValid },
    );

    const proposalSlug = isValid
        ? proposalUtils.getProposalSlug(proposalParams, dao)
        : undefined;
    const proposalUrl = isValid
        ? proposalUtils.getProposalUrl(proposalParams, dao)
        : undefined;

    const { data: proposal } = useProposalBySlug(
        {
            urlParams: { slug: proposalSlug ?? '' },
            queryParams: { daoId: report.daoId },
        },
        { enabled: proposalSlug != null },
    );

    if (proposalUrl == null || proposalSlug == null) {
        // The single association is the card's destination, so an unresolved one still routes the
        // row out to the Safe app; an unresolved extra just drops out of a multi-association row.
        return stretch ? <SafeTransactionCardLink href={fallbackHref} /> : null;
    }

    const title = proposalUtils.getDisplayTitle(
        proposal ?? { title: '' },
        proposalSlug,
    );

    return (
        <div className="flex min-w-0 flex-row items-center gap-2">
            <Tag label={proposalSlug} />
            <Link
                aria-label={`${proposalSlug}: ${title}`}
                className={stretch ? `min-w-0 ${stretchClassName}` : 'min-w-0'}
                href={proposalUrl}
                textClassName={titleClassName}
            >
                {title}
            </Link>
        </div>
    );
};
