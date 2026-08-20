'use client';

import classNames from 'classnames';
import type {
    IMpcPolicyCheckIssue,
    IMpcPolicyCheckResult,
} from '@/modules/mpc/api/mpcService/domain';
import { useTranslations } from '@/shared/components/translationsProvider';
import { weekdayKey } from './mpcPolicyEditorInspector';
import { localizedText } from './mpcPolicyEditorText';
import type { IMpcPolicyCatalogIndex } from './mpcPolicyEditorUtils';

/**
 * What the panel needs to know about each canvas node to word the messages.
 */
export type MpcPolicyEditorNodeMeta = Map<
    string,
    { kind: string; template?: string }
>;

export interface IMpcPolicyEditorCheckPanelProps {
    result: IMpcPolicyCheckResult | null;
    error: string | null;
    isChecking: boolean;
    nodeMeta: MpcPolicyEditorNodeMeta;
    catalogIndex: IMpcPolicyCatalogIndex;
}

const DECISION_KEYS: Record<string, string> = {
    approve: 'app.mpc.mpcPolicyEditor.decision.approve',
    escalate: 'app.mpc.mpcPolicyEditor.decision.escalate',
    deny: 'app.mpc.mpcPolicyEditor.decision.deny',
    notify: 'app.mpc.mpcPolicyEditor.decision.notify',
};

const gweiToEth = (gwei: number, extremeLabel: string): string => {
    const eth = gwei / 1e9;

    if (!Number.isFinite(eth)) {
        return String(gwei);
    }

    if (eth >= 1e6) {
        return `${eth.toExponential(2)} ETH${extremeLabel}`;
    }

    return `${Number(eth.toFixed(9)).toString()} ETH`;
};

const Counterexample: React.FC<{ counterexample: Record<string, unknown> }> = ({
    counterexample,
}) => {
    const { t } = useTranslations();
    const yesNo = (value: unknown) =>
        t(value ? 'app.mpc.mpcPolicyEditor.yes' : 'app.mpc.mpcPolicyEditor.no');
    const rows: [string, string][] = [];
    const label = (key: string) => t(`app.mpc.mpcPolicyEditor.cex.${key}`);

    if ('proposal_kind' in counterexample) {
        rows.push([label('kind'), String(counterexample.proposal_kind)]);
    }

    if ('amount_gwei' in counterexample) {
        const gwei = Number(counterexample.amount_gwei);
        rows.push([
            label('amount'),
            `${gweiToEth(gwei, label('extreme'))}  ·  ${gwei.toString()} gwei`,
        ]);
    }

    if ('erc20_amount' in counterexample) {
        rows.push([label('erc20Amount'), String(counterexample.erc20_amount)]);
    }

    if ('is_delegatecall' in counterexample) {
        rows.push([
            label('delegatecall'),
            yesNo(counterexample.is_delegatecall),
        ]);
    }

    if ('is_token_approval' in counterexample) {
        rows.push([
            label('tokenApproval'),
            yesNo(counterexample.is_token_approval),
        ]);
    }

    if ('approval_is_unlimited' in counterexample) {
        rows.push([
            label('unlimited'),
            yesNo(counterexample.approval_is_unlimited),
        ]);
    }

    if ('dest_whitelisted' in counterexample) {
        rows.push([
            label('whitelisted'),
            yesNo(counterexample.dest_whitelisted),
        ]);
    }

    if ('dest_seen_before' in counterexample) {
        rows.push([
            label('seenBefore'),
            yesNo(counterexample.dest_seen_before),
        ]);
    }

    if ('weekday' in counterexample) {
        const weekday = Number(counterexample.weekday);
        rows.push([
            label('day'),
            `${t(weekdayKey(weekday))} (weekday=${weekday.toString()})`,
        ]);
    }

    if ('hour' in counterexample) {
        rows.push([
            label('hour'),
            `${String(Number(counterexample.hour)).padStart(2, '0')}:00`,
        ]);
    }

    if ('scanner' in counterexample) {
        rows.push([label('scanner'), String(counterexample.scanner)]);
    }

    if ('chain_id' in counterexample) {
        rows.push([label('chainId'), String(counterexample.chain_id)]);
    }

    if ('daily_spent_gwei' in counterexample) {
        const gwei = Number(counterexample.daily_spent_gwei);
        rows.push([
            label('dailySpent'),
            `${gweiToEth(gwei, label('extreme'))}  ·  ${gwei.toString()} gwei`,
        ]);
    }

    if ('has_calldata' in counterexample) {
        rows.push([label('hasCalldata'), yesNo(counterexample.has_calldata)]);
    }

    return (
        <div className="cex">
            <div className="cex-kicker">{label('title')}</div>
            <div className="cex-grid">
                {rows.map(([key, value]) => (
                    <div key={key} style={{ display: 'contents' }}>
                        <span className="k">{key}</span>
                        <span className="v">{value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const issueTitleKey = (issue: IMpcPolicyCheckIssue): string => {
    if (issue.type === 'gap') {
        return issue.subtype === 'unconnected'
            ? 'app.mpc.mpcPolicyEditor.check.type.unconnected'
            : 'app.mpc.mpcPolicyEditor.check.type.gap';
    }

    return `app.mpc.mpcPolicyEditor.check.type.${issue.type}`;
};

const IssueCard: React.FC<{
    issue: IMpcPolicyCheckIssue;
    nodeMeta: MpcPolicyEditorNodeMeta;
    catalogIndex: IMpcPolicyCatalogIndex;
}> = ({ issue, nodeMeta, catalogIndex }) => {
    const { t } = useTranslations();
    const actionNodes = issue.nodes.filter(
        (id) => nodeMeta.get(id)?.kind === 'action',
    );
    const nameOf = (id: string): string => {
        const template = nodeMeta.get(id)?.template;

        if (template == null) {
            return id;
        }

        if (DECISION_KEYS[template] != null) {
            return t(DECISION_KEYS[template]);
        }

        const catalogTemplate = catalogIndex.actions.get(template);

        return catalogTemplate != null
            ? localizedText(catalogTemplate.label)
            : template;
    };

    let message = issue.message;

    if (issue.type === 'gap') {
        message = t(
            issue.subtype === 'unconnected'
                ? 'app.mpc.mpcPolicyEditor.check.message.unconnected'
                : 'app.mpc.mpcPolicyEditor.check.message.gap',
        );
    } else if (issue.type === 'dead_branch' && actionNodes.length >= 1) {
        message = t('app.mpc.mpcPolicyEditor.check.message.deadBranch', {
            action: nameOf(actionNodes[0]),
        });
    } else if (issue.type === 'collision' && actionNodes.length >= 2) {
        let first = nameOf(actionNodes[0]);
        let second = nameOf(actionNodes[1]);

        if (first === second) {
            first = `${first} (${actionNodes[0]})`;
            second = `${second} (${actionNodes[1]})`;
        }

        message = t('app.mpc.mpcPolicyEditor.check.message.collision', {
            first,
            second,
        });
    }

    const counterexample =
        issue.counterexample != null && typeof issue.counterexample === 'object'
            ? issue.counterexample
            : null;
    const uniqueNodes = [...new Set(issue.nodes)];

    return (
        <div className={classNames('issue-card', issue.severity)}>
            <div className="ic-head">
                <span className="ic-tag">
                    {t(`app.mpc.mpcPolicyEditor.${issue.severity}`)}
                </span>
                <span className="ic-title">{t(issueTitleKey(issue))}</span>
            </div>
            <div className="ic-msg">{message}</div>
            {uniqueNodes.length > 0 && (
                <div className="ic-nodes">
                    {uniqueNodes.map((id) => (
                        <span className="chip" key={id}>
                            {id}
                        </span>
                    ))}
                </div>
            )}
            {counterexample != null && (
                <Counterexample counterexample={counterexample} />
            )}
        </div>
    );
};

/**
 * Right-panel "Formal check": banner with the verdict and one card per issue (dead branch, collision, gap).
 */
export const MpcPolicyEditorCheckPanel: React.FC<
    IMpcPolicyEditorCheckPanelProps
> = (props) => {
    const { result, error, isChecking, nodeMeta, catalogIndex } = props;
    const { t } = useTranslations();
    const title = t('app.mpc.mpcPolicyEditor.check.title');

    if (isChecking) {
        return (
            <div>
                <div className="section-title">{title}</div>
                <div className="check-banner">
                    <div className="cb-sub">
                        {t('app.mpc.mpcPolicyEditor.check.running')}
                    </div>
                </div>
            </div>
        );
    }

    if (error != null) {
        return (
            <div>
                <div className="section-title">{title}</div>
                <div className="issue-card error">
                    <div className="ic-head">
                        <span className="ic-tag">
                            {t('app.mpc.mpcPolicyEditor.error')}
                        </span>
                        <span className="ic-title">
                            {t('app.mpc.mpcPolicyEditor.check.failed')}
                        </span>
                    </div>
                    <div className="ic-msg">{error}</div>
                </div>
            </div>
        );
    }

    if (result == null) {
        return null;
    }

    const errors = result.issues.filter((issue) => issue.severity === 'error');
    const warnings = result.issues.filter(
        (issue) => issue.severity === 'warning',
    );
    const isClean = result.consistent && result.issues.length === 0;

    return (
        <div>
            <div className="section-title">{title}</div>
            {isClean ? (
                <div className="check-banner ok">
                    <div className="cb-title">
                        {t('app.mpc.mpcPolicyEditor.check.clean.title')}
                    </div>
                    <div className="cb-sub">
                        {t('app.mpc.mpcPolicyEditor.check.clean.description')}
                    </div>
                </div>
            ) : result.consistent ? (
                <div className="check-banner ok">
                    <div className="cb-title">
                        {t('app.mpc.mpcPolicyEditor.check.warnings.title')}
                    </div>
                    <div className="cb-sub">
                        {t(
                            warnings.length === 1
                                ? 'app.mpc.mpcPolicyEditor.check.warnings.descriptionOne'
                                : 'app.mpc.mpcPolicyEditor.check.warnings.descriptionMany',
                            { count: warnings.length },
                        )}
                    </div>
                </div>
            ) : (
                <div
                    className="check-banner warn"
                    style={{
                        background: 'var(--critical-100)',
                        borderColor: 'var(--critical)',
                    }}
                >
                    <div
                        className="cb-title"
                        style={{ color: 'var(--critical)' }}
                    >
                        {t(
                            errors.length === 1
                                ? 'app.mpc.mpcPolicyEditor.check.problems.titleOne'
                                : 'app.mpc.mpcPolicyEditor.check.problems.titleMany',
                            { count: errors.length },
                        )}
                    </div>
                    <div className="cb-sub">
                        {t(
                            'app.mpc.mpcPolicyEditor.check.problems.description',
                        )}
                    </div>
                </div>
            )}
            {result.issues.map((issue, index) => (
                <IssueCard
                    catalogIndex={catalogIndex}
                    issue={issue}
                    key={`${issue.type}-${index.toString()}`}
                    nodeMeta={nodeMeta}
                />
            ))}
        </div>
    );
};
