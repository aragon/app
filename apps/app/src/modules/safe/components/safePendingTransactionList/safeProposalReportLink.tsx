'use client';

import { Link } from '@aragon/gov-ui-kit';
import { proposalUtils } from '@/modules/governance/utils/proposalUtils';
import { useDao } from '@/shared/api/daoService';
import {
    type IAragonProposalReport,
    isAragonProposalReport,
} from '@/shared/api/safeService';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface ISafeProposalReportLinkProps {
    /**
     * Proposal this transaction's calldata reports to.
     */
    report: IAragonProposalReport;
}

/**
 * Links one report to its Aragon proposal.
 *
 * One component per report rather than one per row: entries can span different DAOs, so each needs
 * its own `useDao`. Rows reporting to the same DAO share a single request through the query cache.
 *
 * Falls back to plain text when the entry is malformed, or when the DAO or its plugin does not
 * resolve - `getProposalUrl` returns undefined for an uninstalled or unsupported plugin, and a
 * dead link is worse than no link. Text rather than nothing, because rendering nothing left the
 * row's "Reports to" label dangling with no object, which reads as a broken surface and hides
 * that the transaction is a governance report at all. The row and its Safe app link are
 * unaffected either way.
 */
export const SafeProposalReportLink: React.FC<ISafeProposalReportLinkProps> = ({
    report,
}) => {
    const { t } = useTranslations();
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

    const proposalUrl = isValid
        ? proposalUtils.getProposalUrl(proposalParams, dao)
        : undefined;

    if (proposalUrl == null) {
        return (
            <span className="text-neutral-500 text-sm leading-tight">
                {t(
                    'app.safe.safePendingTransactionList.item.reportUnidentified',
                )}
            </span>
        );
    }

    return (
        <Link href={proposalUrl} textClassName="text-sm leading-tight">
            {proposalUtils.getProposalSlug(proposalParams, dao)}
        </Link>
    );
};
