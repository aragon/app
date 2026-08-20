'use client';

import classNames from 'classnames';
import type {
    IMpcPolicyCatalogParam,
    IMpcPolicyCatalogTemplate,
    IMpcPolicyKindFamilies,
    IMpcWorkspacePolicy,
} from '@/modules/mpc/api/mpcService/domain';
import { useTranslations } from '@/shared/components/translationsProvider';
import { localizedText } from './mpcPolicyEditorText';
import type { MpcPolicyEditorNode } from './mpcPolicyEditorUtils';

export interface IMpcPolicyEditorInspectorProps {
    node: MpcPolicyEditorNode;
    template?: IMpcPolicyCatalogTemplate;
    /**
     * Proposal kind families to group the `kind` enum (from the catalog).
     */
    kindFamilies?: IMpcPolicyKindFamilies;
    /**
     * Saved policies selectable by policy blocks (the one being edited excluded).
     */
    policyOptions?: Pick<IMpcWorkspacePolicy, 'id' | 'name'>[];
    onChange: (nodeId: string, params: Record<string, unknown>) => void;
    onDelete: (nodeId: string) => void;
}

const ENUM_LABEL_KEYS: Record<string, string> = {
    lt: 'app.mpc.mpcPolicyEditor.enum.lt',
    lte: 'app.mpc.mpcPolicyEditor.enum.lte',
    gte: 'app.mpc.mpcPolicyEditor.enum.gte',
    gt: 'app.mpc.mpcPolicyEditor.enum.gt',
    safe: 'app.mpc.mpcPolicyEditor.enum.safe',
    suspicious: 'app.mpc.mpcPolicyEditor.enum.suspicious',
    malicious: 'app.mpc.mpcPolicyEditor.enum.malicious',
    webhook: 'app.mpc.mpcPolicyEditor.enum.webhook',
    telegram_stub: 'app.mpc.mpcPolicyEditor.enum.telegramStub',
};

const RISK_LABEL_KEYS: Record<string, string> = {
    medio: 'app.mpc.mpcPolicyEditor.risk.medium',
    alto: 'app.mpc.mpcPolicyEditor.risk.high',
    critico: 'app.mpc.mpcPolicyEditor.risk.critical',
    variable: 'app.mpc.mpcPolicyEditor.risk.variable',
};

export const weekdayKey = (weekday: number): string =>
    `app.mpc.mpcPolicyEditor.weekday.${weekday.toString()}`;

const ParamField: React.FC<{
    param: IMpcPolicyCatalogParam;
    value: unknown;
    onSet: (value: unknown) => void;
    kindFamilies?: IMpcPolicyKindFamilies;
    policyOptions?: Pick<IMpcWorkspacePolicy, 'id' | 'name'>[];
}> = ({ param, value, onSet, kindFamilies, policyOptions }) => {
    const { t } = useTranslations();
    const label = param.label != null ? localizedText(param.label) : param.name;
    const help = param.help != null ? localizedText(param.help) : '';

    if (param.type === 'policy_ref') {
        const current = String(value ?? '');
        const options = policyOptions ?? [];
        const known = options.some((option) => option.id === current);

        return (
            <div className="field">
                <label>{label}</label>
                <select
                    onChange={(event) => onSet(event.target.value)}
                    value={current}
                >
                    {!known && (
                        <option value={current}>
                            {t('app.mpc.mpcPolicyEditor.policyRef.unknown')}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.name}
                        </option>
                    ))}
                </select>
                <div className="hint" style={{ marginTop: 4 }}>
                    {t('app.mpc.mpcPolicyEditor.policyRef.description')}
                </div>
            </div>
        );
    }

    if (param.type === 'enum') {
        if (param.grouped && kindFamilies != null) {
            const values = (param.values ?? []).map(String);
            const current = String(value ?? '');
            const kindMeta = kindFamilies.kinds[current];
            const family = kindMeta?.family;
            const familyMeta =
                family != null ? kindFamilies.families[family] : undefined;

            return (
                <div className="field">
                    <label>{label}</label>
                    <select
                        onChange={(event) => onSet(event.target.value)}
                        value={current}
                    >
                        {kindFamilies.order.map((familyKey) => {
                            const inFamily = values.filter(
                                (item) =>
                                    kindFamilies.kinds[item]?.family ===
                                    familyKey,
                            );

                            if (inFamily.length === 0) {
                                return null;
                            }

                            const familyLabel =
                                kindFamilies.families[familyKey];

                            return (
                                <optgroup
                                    key={familyKey}
                                    label={
                                        familyLabel != null
                                            ? localizedText(familyLabel.label)
                                            : familyKey
                                    }
                                >
                                    {inFamily.map((item) => (
                                        <option key={item} value={item}>
                                            {kindFamilies.kinds[item] != null
                                                ? localizedText(
                                                      kindFamilies.kinds[item]
                                                          .label,
                                                  )
                                                : item}
                                        </option>
                                    ))}
                                </optgroup>
                            );
                        })}
                    </select>
                    {kindMeta != null && (
                        <div className="hint" style={{ marginTop: 4 }}>
                            {localizedText(kindMeta.description)}
                        </div>
                    )}
                    {familyMeta != null && family != null && (
                        <div
                            className={classNames('fam-badge', `fam-${family}`)}
                        >
                            {localizedText(familyMeta.label)}
                            {familyMeta.risk != null
                                ? t('app.mpc.mpcPolicyEditor.inspector.risk', {
                                      risk:
                                          RISK_LABEL_KEYS[familyMeta.risk] !=
                                          null
                                              ? t(
                                                    RISK_LABEL_KEYS[
                                                        familyMeta.risk
                                                    ],
                                                )
                                              : familyMeta.risk,
                                  })
                                : ''}
                            : {localizedText(familyMeta.description)}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="field">
                <label>{label}</label>
                <select
                    onChange={(event) => onSet(event.target.value)}
                    value={String(value ?? '')}
                >
                    {(param.values ?? []).map((item) => (
                        <option key={String(item)} value={String(item)}>
                            {ENUM_LABEL_KEYS[String(item)] != null
                                ? t(ENUM_LABEL_KEYS[String(item)])
                                : String(item)}
                        </option>
                    ))}
                </select>
                {help.length > 0 && (
                    <div className="hint" style={{ marginTop: 4 }}>
                        {help}
                    </div>
                )}
            </div>
        );
    }

    if (param.type === 'bool') {
        return (
            <div className="field">
                <label>{label}</label>
                <div className="seg">
                    <button
                        className={value ? 'on' : ''}
                        onClick={() => onSet(true)}
                        type="button"
                    >
                        {t('app.mpc.mpcPolicyEditor.yes')}
                    </button>
                    <button
                        className={value ? '' : 'on'}
                        onClick={() => onSet(false)}
                        type="button"
                    >
                        {t('app.mpc.mpcPolicyEditor.no')}
                    </button>
                </div>
                {help.length > 0 && (
                    <div className="hint" style={{ marginTop: 4 }}>
                        {help}
                    </div>
                )}
            </div>
        );
    }

    if (param.type === 'multiselect') {
        const selected = Array.isArray(value)
            ? (value as unknown[]).map(Number)
            : [];

        return (
            <div className="field">
                <label>{label}</label>
                <div className="seg" style={{ flexWrap: 'wrap' }}>
                    {(param.values ?? []).map((item) => {
                        const numeric = Number(item);
                        const isOn = selected.includes(numeric);

                        return (
                            <button
                                className={isOn ? 'on' : ''}
                                key={String(item)}
                                onClick={() =>
                                    onSet(
                                        isOn
                                            ? selected.filter(
                                                  (entry) => entry !== numeric,
                                              )
                                            : [...selected, numeric].sort(
                                                  (a, b) => a - b,
                                              ),
                                    )
                                }
                                style={{ flex: '0 0 auto', minWidth: 34 }}
                                title={
                                    param.name === 'weekdays'
                                        ? t(weekdayKey(numeric))
                                        : undefined
                                }
                                type="button"
                            >
                                {String(item)}
                            </button>
                        );
                    })}
                </div>
                {help.length > 0 && (
                    <div className="hint" style={{ marginTop: 4 }}>
                        {help}
                    </div>
                )}
            </div>
        );
    }

    // decimal (ETH) and biguint (token units, may exceed 2^53): text inputs, never type=number.
    if (param.type === 'decimal' || param.type === 'biguint') {
        return (
            <div className="field">
                <label>{label}</label>
                <input
                    inputMode={param.type === 'biguint' ? 'numeric' : 'decimal'}
                    onChange={(event) => onSet(event.target.value)}
                    type="text"
                    value={String(value ?? '')}
                />
                {help.length > 0 && (
                    <div className="hint" style={{ marginTop: 4 }}>
                        {help}
                    </div>
                )}
            </div>
        );
    }

    // int / duration / fallback
    return (
        <div className="field">
            <label>
                {label}
                {param.type === 'duration'
                    ? t('app.mpc.mpcPolicyEditor.inspector.seconds')
                    : ''}
            </label>
            {help.length > 0 && (
                <div className="hint" style={{ marginBottom: 4 }}>
                    {help}
                </div>
            )}
            <input
                max={param.max}
                min={param.min}
                onChange={(event) => onSet(Number(event.target.value))}
                type="number"
                value={Number(value ?? 0)}
            />
        </div>
    );
};

/**
 * Right-panel inspector of the selected block: description, technical note and parameter fields.
 */
export const MpcPolicyEditorInspector: React.FC<
    IMpcPolicyEditorInspectorProps
> = (props) => {
    const { node, template, kindFamilies, policyOptions, onChange, onDelete } =
        props;
    const { t } = useTranslations();

    if (node.data.kind === 'trigger') {
        return (
            <div>
                <div className="section-title">
                    {t('app.mpc.mpcPolicyEditor.inspector.title')}
                </div>
                <div className="decision-card">
                    <div className="dc-kicker">
                        {t('app.mpc.mpcPolicyEditor.node.trigger')}
                    </div>
                    <div className="dc-detail" style={{ marginTop: 6 }}>
                        {t(
                            'app.mpc.mpcPolicyEditor.inspector.triggerDescription',
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const { params } = node.data;
    const setParam = (name: string, value: unknown) =>
        onChange(node.id, { ...params, [name]: value });

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <div className="section-title" style={{ margin: 0 }}>
                    {t('app.mpc.mpcPolicyEditor.inspector.title')}
                </div>
                <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => onDelete(node.id)}
                    type="button"
                >
                    {t('app.mpc.mpcPolicyEditor.inspector.delete')}
                </button>
            </div>
            <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
                    {node.data.templateLabel}
                </div>
                <div className="hint" style={{ marginBottom: 8 }}>
                    {localizedText(template?.description)}
                </div>
                {template?.techNote != null && (
                    <details className="technote">
                        <summary>
                            {t('app.mpc.mpcPolicyEditor.inspector.techNote')}
                        </summary>
                        <p>{localizedText(template.techNote)}</p>
                    </details>
                )}
                {(template?.params ?? []).length === 0 && (
                    <div className="hint">
                        {t('app.mpc.mpcPolicyEditor.inspector.noParams')}
                    </div>
                )}
                {(template?.params ?? []).map((param) => (
                    <ParamField
                        key={param.name}
                        kindFamilies={kindFamilies}
                        onSet={(value) => setParam(param.name, value)}
                        param={param}
                        policyOptions={policyOptions}
                        value={params[param.name]}
                    />
                ))}
            </div>
        </div>
    );
};
