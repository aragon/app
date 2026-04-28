import { Button, Dialog, IconType, invariant, Tag } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import type {
    IProposalAudit,
    IProposalAuditFinding,
} from '../../api/governanceService/domain';

export interface IProposalAuditDialogParams {
    /**
     * Audit payload to render. Either a freshly-produced result from the
     * `POST /v2/proposals/:id/audit` endpoint or the cached one persisted on
     * the Proposal document.
     */
    audit: IProposalAudit;
}

export interface IProposalAuditDialogProps
    extends IDialogComponentProps<IProposalAuditDialogParams> {}

const RISK_CLASSES: Record<string, string> = {
    low: 'bg-success-500 text-white',
    medium: 'bg-warning-500 text-white',
    high: 'bg-critical-500 text-white',
    critical: 'bg-critical-800 text-white',
};

const SEVERITY_VARIANT: Record<
    string,
    'info' | 'success' | 'warning' | 'critical' | 'neutral'
> = {
    info: 'info',
    low: 'success',
    medium: 'warning',
    high: 'critical',
    critical: 'critical',
};

function FindingItem({
    finding,
    actionLabel,
}: {
    finding: IProposalAuditFinding;
    actionLabel: (index: number) => string;
}) {
    const severity = (finding.severity ?? 'info').toLowerCase();
    const variant = SEVERITY_VARIANT[severity] ?? 'neutral';

    return (
        <li className="rounded-lg border border-neutral-100 bg-neutral-0 p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
                <Tag label={severity.toUpperCase()} variant={variant} />
                <span className="font-semibold text-neutral-800">
                    {finding.category}
                </span>
                {finding.actionIndex != null && (
                    <span className="text-neutral-500 text-sm">
                        {actionLabel(finding.actionIndex)}
                    </span>
                )}
            </div>
            <p className="text-neutral-600 text-sm">{finding.description}</p>
        </li>
    );
}

export const ProposalAuditDialog: React.FC<IProposalAuditDialogProps> = (
    props,
) => {
    const { params } = props.location;

    invariant(
        params != null,
        'ProposalAuditDialog: params must be set for the dialog to work correctly',
    );

    const { audit } = params;

    const { t } = useTranslations();

    const riskKey = (audit.riskLevel ?? 'low').toLowerCase();
    const riskClass = RISK_CLASSES[riskKey] ?? RISK_CLASSES.low;

    return (
        <>
            <Dialog.Header
                title={t('app.governance.proposalAuditDialog.title')}
            />
            <Dialog.Content className="flex flex-col gap-4 pb-3">
                <div
                    className={classNames(
                        'flex flex-col gap-2 rounded-lg p-4',
                        riskClass,
                    )}
                >
                    <span className="font-semibold text-xs uppercase tracking-wide opacity-70">
                        {t('app.governance.proposalAuditDialog.riskLevel')}
                    </span>
                    <span className="font-bold text-2xl">
                        {riskKey.toUpperCase()}
                    </span>
                </div>

                <section className="flex flex-col gap-2">
                    <h3 className="font-semibold text-base text-neutral-800">
                        {t('app.governance.proposalAuditDialog.summary')}
                    </h3>
                    <p className="text-neutral-600 text-sm">{audit.summary}</p>
                </section>

                <section className="flex flex-col gap-2">
                    <h3 className="font-semibold text-base text-neutral-800">
                        {t('app.governance.proposalAuditDialog.findings', {
                            count: audit.findings.length,
                        })}
                    </h3>
                    {audit.findings.length === 0 ? (
                        <p className="text-neutral-500 text-sm">
                            {t('app.governance.proposalAuditDialog.noFindings')}
                        </p>
                    ) : (
                        <ul className="flex flex-col gap-2">
                            {audit.findings.map((f, i) => (
                                <FindingItem
                                    actionLabel={(index) =>
                                        t(
                                            'app.governance.proposalAuditDialog.actionIndex',
                                            { index: index + 1 },
                                        )
                                    }
                                    finding={f}
                                    key={`${f.category}-${i}`}
                                />
                            ))}
                        </ul>
                    )}
                </section>

                {audit.recommendations.length > 0 && (
                    <section className="flex flex-col gap-2">
                        <h3 className="font-semibold text-base text-neutral-800">
                            {t(
                                'app.governance.proposalAuditDialog.recommendations',
                            )}
                        </h3>
                        <ol className="flex list-decimal flex-col gap-1 pl-5 text-neutral-600 text-sm">
                            {audit.recommendations.map((rec, i) => (
                                <li key={i}>{rec}</li>
                            ))}
                        </ol>
                    </section>
                )}

                {audit.tenderlyUrl && (
                    <footer className="flex flex-wrap items-center gap-3 border-neutral-100 border-t pt-3">
                        <Button
                            href={audit.tenderlyUrl}
                            iconRight={IconType.LINK_EXTERNAL}
                            size="sm"
                            target="_blank"
                            variant="tertiary"
                        >
                            {t(
                                'app.governance.proposalAuditDialog.tenderlyLink',
                            )}
                        </Button>
                    </footer>
                )}
            </Dialog.Content>
        </>
    );
};
