'use client';

import classNames from 'classnames';
import { useMemo, useState } from 'react';
import type {
    IMpcPolicySimContext,
    IMpcPolicySimResult,
    MpcPolicyActionOperation,
    MpcPolicyScannerResult,
} from '@/modules/mpc/api/mpcService/domain';
import { useTranslations } from '@/shared/components/translationsProvider';
import { weekdayKey } from './mpcPolicyEditorInspector';
import { formatDurationSeconds } from './mpcPolicyEditorText';

export interface IMpcPolicyEditorSimPanelProps {
    /**
     * Runs the simulation on the policy engine with the given context.
     */
    onSimulate: (context: IMpcPolicySimContext) => void;
    onClear: () => void;
    result: IMpcPolicySimResult | null;
    isSimulating: boolean;
}

/**
 * ETH decimal string -> wei decimal string, BigInt only (never floats).
 */
export const ethToWei = (eth: string): string => {
    try {
        const value = eth.trim() || '0';

        if (!/^[0-9]*\.?[0-9]*$/.test(value)) {
            return '0';
        }

        const [integer, fraction = ''] = value.split('.');
        const fraction18 = `${fraction}000000000000000000`.slice(0, 18);

        return (
            BigInt(integer || '0') * BigInt(10) ** BigInt(18) +
            BigInt(fraction18 || '0')
        ).toString();
    } catch {
        return '0';
    }
};

const localInputToUnixUtc = (value: string): number => {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);

    if (match == null) {
        return 0;
    }

    return Math.floor(
        Date.UTC(
            Number(match[1]),
            Number(match[2]) - 1,
            Number(match[3]),
            Number(match[4]),
            Number(match[5]),
        ) / 1000,
    );
};

const unixToLocalInput = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const pad = (value: number) => String(value).padStart(2, '0');

    return `${date.getUTCFullYear().toString()}-${pad(date.getUTCMonth() + 1)}-${pad(
        date.getUTCDate(),
    )}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
};

// Integer arithmetic (same as the engine): 1970-01-01 was a Thursday; ISO 1 = Monday .. 7 = Sunday.
const isoWeekday = (timestamp: number): number => {
    const day = Math.floor(timestamp / 86_400);

    return ((((day + 3) % 7) + 7) % 7) + 1;
};

const hourUtc = (timestamp: number): number =>
    Math.floor((((timestamp % 86_400) + 86_400) % 86_400) / 3600);

interface IPreset {
    labelKey: string;
    eth: string;
    whitelisted: boolean;
    seenBefore: boolean;
    timestamp: number;
    scanner: MpcPolicyScannerResult;
    to?: string;
    data?: string;
    operation?: MpcPolicyActionOperation;
}

const EXAMPLE_DESTINATION = '0x000000000000000000000000000000000000abcd';
const EXAMPLE_TOKEN = '0x2222222222222222222222222222222222222222';

// Real calldata vectors (cast calldata), same as the engine test vectors.
const CALLDATA = {
    transfer5000Usdc:
        '0xa9059cbb000000000000000000000000000000000000000000000000000000000000abcd000000000000000000000000000000000000000000000000000000012a05f200',
    approveMax:
        '0x095ea7b3000000000000000000000000000000000000000000000000000000000000abcdffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
};

// Tuesday 2026-08-18 10:00 UTC / Sunday 2026-08-16 03:00 UTC.
const WORKING_HOURS_TS = 1_786_960_800;
const WEEKEND_TS = 1_786_849_200;

const PRESETS: IPreset[] = [
    {
        labelKey: 'approve',
        eth: '0.5',
        whitelisted: true,
        seenBefore: true,
        timestamp: WORKING_HOURS_TS,
        scanner: 'safe',
    },
    {
        labelKey: 'escalate',
        eth: '2.5',
        whitelisted: false,
        seenBefore: false,
        timestamp: WORKING_HOURS_TS,
        scanner: 'safe',
    },
    {
        labelKey: 'weekend',
        eth: '2.5',
        whitelisted: false,
        seenBefore: false,
        timestamp: WEEKEND_TS,
        scanner: 'safe',
    },
    {
        labelKey: 'suspicious',
        eth: '0.2',
        whitelisted: false,
        seenBefore: false,
        timestamp: WORKING_HOURS_TS,
        scanner: 'suspicious',
    },
    {
        labelKey: 'erc20',
        eth: '0',
        whitelisted: false,
        seenBefore: false,
        timestamp: WORKING_HOURS_TS,
        scanner: 'safe',
        to: EXAMPLE_TOKEN,
        data: CALLDATA.transfer5000Usdc,
        operation: 'call',
    },
    {
        labelKey: 'approveMax',
        eth: '0',
        whitelisted: false,
        seenBefore: false,
        timestamp: WORKING_HOURS_TS,
        scanner: 'safe',
        to: EXAMPLE_TOKEN,
        data: CALLDATA.approveMax,
        operation: 'call',
    },
];

const DecisionCard: React.FC<{ result: IMpcPolicySimResult }> = ({
    result,
}) => {
    const { t } = useTranslations();
    const { template, params } = result.decision;
    const className =
        template === 'approve'
            ? 'decision-approve'
            : template === 'escalate'
              ? 'decision-escalate'
              : template === 'notify'
                ? ''
                : 'decision-deny';
    const knownTemplates = ['approve', 'escalate', 'deny', 'notify'];
    const title = knownTemplates.includes(template)
        ? t(`app.mpc.mpcPolicyEditor.decision.${template}`)
        : template;
    let detail = '';

    if (template === 'approve') {
        detail = t('app.mpc.mpcPolicyEditor.decision.approveDetail');
    } else if (template === 'escalate') {
        const approvals = Number(params.extra_approvals);
        const delaySeconds = Number(params.delay_seconds);
        const delay = delaySeconds
            ? t('app.mpc.mpcPolicyEditor.decision.escalateDelay', {
                  delay: formatDurationSeconds(
                      delaySeconds,
                      t('app.mpc.mpcPolicyEditor.duration.none'),
                  ),
              })
            : t('app.mpc.mpcPolicyEditor.decision.escalateNoDelay');
        detail = t(
            approvals === 1
                ? 'app.mpc.mpcPolicyEditor.decision.escalateOne'
                : 'app.mpc.mpcPolicyEditor.decision.escalateMany',
            { count: approvals, delay },
        );
    } else if (template === 'deny') {
        detail = t(
            result.actionNodeId == null
                ? 'app.mpc.mpcPolicyEditor.decision.denyDefault'
                : 'app.mpc.mpcPolicyEditor.decision.denyExplicit',
        );
    } else if (template === 'notify') {
        detail = t('app.mpc.mpcPolicyEditor.decision.notifyDetail');
    }

    return (
        <div className={classNames('decision-card', className)}>
            <div className="dc-kicker">
                {t('app.mpc.mpcPolicyEditor.decision.kicker')}
            </div>
            <div className="dc-title">{title}</div>
            <div className="dc-detail">{detail}</div>
            {result.derived.proposal_kind != null && (
                <div className="dc-detail" style={{ marginTop: 6 }}>
                    {t('app.mpc.mpcPolicyEditor.decision.derivedKind')}
                    <b>{result.derived.proposal_kind}</b>
                    {result.derived.erc20_amount != null &&
                        t('app.mpc.mpcPolicyEditor.decision.erc20Amount', {
                            amount: result.derived.erc20_amount,
                        })}
                    {result.derived.approval_is_unlimited &&
                        t('app.mpc.mpcPolicyEditor.decision.unlimited')}
                </div>
            )}
            <div className="path-chips">
                {result.path.map((id) => (
                    <span className="chip" key={id}>
                        {id}
                    </span>
                ))}
            </div>
        </div>
    );
};

/**
 * Right-panel "Simulate transaction": builds a sample transaction context and shows the engine decision.
 */
export const MpcPolicyEditorSimPanel: React.FC<
    IMpcPolicyEditorSimPanelProps
> = (props) => {
    const { onSimulate, onClear, result, isSimulating } = props;
    const { t } = useTranslations();
    const [eth, setEth] = useState('2.5');
    const [whitelisted, setWhitelisted] = useState(false);
    const [seenBefore, setSeenBefore] = useState(false);
    const [when, setWhen] = useState(unixToLocalInput(WORKING_HOURS_TS));
    const [scanner, setScanner] = useState<MpcPolicyScannerResult>('safe');
    const [to, setTo] = useState(EXAMPLE_DESTINATION);
    const [data, setData] = useState('0x');
    const [operation, setOperation] =
        useState<MpcPolicyActionOperation>('call');
    const [chainId, setChainId] = useState('11155111');
    const [dailySpentEth, setDailySpentEth] = useState('');

    const timestamp = useMemo(() => localInputToUnixUtc(when), [when]);
    const weekday = isoWeekday(timestamp);
    const hour = hourUtc(timestamp);
    const valueWei = ethToWei(eth);

    const applyPreset = (preset: IPreset) => {
        setEth(preset.eth);
        setWhitelisted(preset.whitelisted);
        setSeenBefore(preset.seenBefore);
        setWhen(unixToLocalInput(preset.timestamp));
        setScanner(preset.scanner);
        setTo(preset.to ?? EXAMPLE_DESTINATION);
        setData(preset.data ?? '0x');
        setOperation(preset.operation ?? 'call');
    };

    const run = () => {
        const chain = Number(chainId);
        // The 24 h spend defaults to this transaction alone (nothing else spent in the window).
        const dailySpentWei =
            dailySpentEth.trim() === '' ? valueWei : ethToWei(dailySpentEth);

        onSimulate({
            amount_wei: valueWei,
            dest_whitelisted: whitelisted,
            dest_seen_before: seenBefore,
            timestamp,
            scanner,
            action_to: to.trim(),
            action_value_wei: valueWei,
            action_data: data.trim() || '0x',
            action_operation: operation,
            ...(Number.isInteger(chain) && chain > 0
                ? { chain_id: chain }
                : {}),
            daily_spent_wei: dailySpentWei,
        });
    };

    const yesLabel = t('app.mpc.mpcPolicyEditor.yes');
    const noLabel = t('app.mpc.mpcPolicyEditor.no');

    return (
        <div>
            <div className="section-title">
                {t('app.mpc.mpcPolicyEditor.sim.title')}
            </div>
            <div className="field">
                <label>{t('app.mpc.mpcPolicyEditor.sim.amount')}</label>
                <input
                    inputMode="decimal"
                    onChange={(event) => setEth(event.target.value)}
                    type="text"
                    value={eth}
                />
                <div className="hint" style={{ marginTop: 4 }}>
                    {t('app.mpc.mpcPolicyEditor.sim.amountWei', {
                        wei: valueWei,
                    })}
                </div>
            </div>
            <div className="field">
                <label>{t('app.mpc.mpcPolicyEditor.sim.to')}</label>
                <input
                    onChange={(event) => setTo(event.target.value)}
                    spellCheck={false}
                    style={{ fontFamily: 'monospace', fontSize: 11 }}
                    type="text"
                    value={to}
                />
            </div>
            <div className="field">
                <label>{t('app.mpc.mpcPolicyEditor.sim.data')}</label>
                <textarea
                    onChange={(event) => setData(event.target.value)}
                    rows={3}
                    spellCheck={false}
                    style={{
                        fontFamily: 'monospace',
                        fontSize: 11,
                        width: '100%',
                        resize: 'vertical',
                    }}
                    value={data}
                />
            </div>
            <div className="field">
                <label>{t('app.mpc.mpcPolicyEditor.sim.operation')}</label>
                <div className="seg">
                    <button
                        className={operation === 'call' ? 'on' : ''}
                        onClick={() => setOperation('call')}
                        type="button"
                    >
                        call
                    </button>
                    <button
                        className={operation === 'delegatecall' ? 'on' : ''}
                        onClick={() => setOperation('delegatecall')}
                        type="button"
                    >
                        delegatecall
                    </button>
                </div>
            </div>
            <div className="field">
                <label>{t('app.mpc.mpcPolicyEditor.sim.whitelisted')}</label>
                <div className="seg">
                    <button
                        className={whitelisted ? 'on' : ''}
                        onClick={() => setWhitelisted(true)}
                        type="button"
                    >
                        {yesLabel}
                    </button>
                    <button
                        className={whitelisted ? '' : 'on'}
                        onClick={() => setWhitelisted(false)}
                        type="button"
                    >
                        {noLabel}
                    </button>
                </div>
                <div className="hint" style={{ marginTop: 4 }}>
                    {t('app.mpc.mpcPolicyEditor.sim.whitelistedHint')}
                </div>
            </div>
            <div className="field">
                <label>{t('app.mpc.mpcPolicyEditor.sim.seenBefore')}</label>
                <div className="seg">
                    <button
                        className={seenBefore ? 'on' : ''}
                        onClick={() => setSeenBefore(true)}
                        type="button"
                    >
                        {yesLabel}
                    </button>
                    <button
                        className={seenBefore ? '' : 'on'}
                        onClick={() => setSeenBefore(false)}
                        type="button"
                    >
                        {noLabel}
                    </button>
                </div>
            </div>
            <div className="field">
                <label>{t('app.mpc.mpcPolicyEditor.sim.when')}</label>
                <input
                    onChange={(event) => setWhen(event.target.value)}
                    type="datetime-local"
                    value={when}
                />
                <div className="hint" style={{ marginTop: 4 }}>
                    {t('app.mpc.mpcPolicyEditor.sim.whenHint', {
                        day: t(weekdayKey(weekday)),
                        hour: String(hour).padStart(2, '0'),
                        weekday,
                    })}
                </div>
            </div>
            <div className="field">
                <label>{t('app.mpc.mpcPolicyEditor.sim.chainId')}</label>
                <input
                    inputMode="numeric"
                    onChange={(event) => setChainId(event.target.value)}
                    type="text"
                    value={chainId}
                />
            </div>
            <div className="field">
                <label>{t('app.mpc.mpcPolicyEditor.sim.dailySpent')}</label>
                <input
                    inputMode="decimal"
                    onChange={(event) => setDailySpentEth(event.target.value)}
                    placeholder={eth}
                    type="text"
                    value={dailySpentEth}
                />
                <div className="hint" style={{ marginTop: 4 }}>
                    {t('app.mpc.mpcPolicyEditor.sim.dailySpentHint')}
                </div>
            </div>
            <div className="field">
                <label>{t('app.mpc.mpcPolicyEditor.sim.scanner')}</label>
                <select
                    onChange={(event) =>
                        setScanner(event.target.value as MpcPolicyScannerResult)
                    }
                    value={scanner}
                >
                    <option value="safe">safe</option>
                    <option value="suspicious">suspicious</option>
                    <option value="malicious">malicious</option>
                </select>
            </div>
            <div className="toolbar" style={{ marginBottom: 12 }}>
                <button
                    className="btn btn-primary"
                    disabled={isSimulating}
                    onClick={run}
                    style={{ flex: 1 }}
                    type="button"
                >
                    {t(
                        isSimulating
                            ? 'app.mpc.mpcPolicyEditor.sim.running'
                            : 'app.mpc.mpcPolicyEditor.sim.run',
                    )}
                </button>
                <button className="btn" onClick={onClear} type="button">
                    {t('app.mpc.mpcPolicyEditor.sim.clear')}
                </button>
            </div>
            <div className="field">
                <label>{t('app.mpc.mpcPolicyEditor.sim.presets')}</label>
                <div
                    style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
                >
                    {PRESETS.map((preset) => (
                        <button
                            className="btn btn-sm"
                            key={preset.labelKey}
                            onClick={() => applyPreset(preset)}
                            style={{ textAlign: 'left' }}
                            type="button"
                        >
                            {t(
                                `app.mpc.mpcPolicyEditor.sim.preset.${preset.labelKey}`,
                            )}
                        </button>
                    ))}
                </div>
            </div>
            {result != null && <DecisionCard result={result} />}
        </div>
    );
};
