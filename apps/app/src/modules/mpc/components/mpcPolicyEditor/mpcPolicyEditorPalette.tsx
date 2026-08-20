'use client';

import classNames from 'classnames';
import type {
    IMpcPolicyCatalogGroup,
    IMpcPolicyCatalogTemplate,
    IMpcWorkspacePolicy,
} from '@/modules/mpc/api/mpcService/domain';
import { useTranslations } from '@/shared/components/translationsProvider';
import { localizedText } from './mpcPolicyEditorText';
import { policyRefTemplate } from './mpcPolicyEditorUtils';

export type MpcPolicyEditorBlockKind = 'condition' | 'action';

export interface IMpcPolicyEditorPaletteProps {
    /**
     * Condition groups defined by the catalog (proposal / offchain).
     */
    conditionGroups?: Record<string, IMpcPolicyCatalogGroup>;
    conditions: IMpcPolicyCatalogTemplate[];
    actions: IMpcPolicyCatalogTemplate[];
    /**
     * Saved policies of the workspace, offered as "policy blocks" (the one being edited is excluded).
     */
    workspacePolicies?: IMpcWorkspacePolicy[];
    /**
     * Id of the policy being edited (cannot be used as a block inside itself).
     */
    currentPolicyId?: string;
    /**
     * Adds a block to the canvas (click); drag & drop is handled by the canvas drop handler.
     */
    onAdd: (
        kind: MpcPolicyEditorBlockKind,
        template: IMpcPolicyCatalogTemplate,
    ) => void;
}

/**
 * Drag payload of a palette item.
 */
export interface IMpcPolicyEditorDragPayload {
    kind: MpcPolicyEditorBlockKind;
    template: string;
    /**
     * Referenced policy (policy blocks only).
     */
    policyId?: string;
}

export const MPC_POLICY_EDITOR_DRAG_TYPE = 'application/x-mpc-policy-block';

const GROUP_ORDER = ['proposal', 'offchain'];

const FACT_SOURCE_KEYS: Record<string, string> = {
    history: 'app.mpc.mpcPolicyEditor.palette.source.history',
    service: 'app.mpc.mpcPolicyEditor.palette.source.service',
    'chain-time': 'app.mpc.mpcPolicyEditor.palette.source.chainTime',
};

const PaletteItem: React.FC<{
    template: IMpcPolicyCatalogTemplate;
    kind: MpcPolicyEditorBlockKind;
    onAdd: IMpcPolicyEditorPaletteProps['onAdd'];
}> = ({ template, kind, onAdd }) => {
    const { t } = useTranslations();
    const sourceKey =
        template.factSource != null
            ? FACT_SOURCE_KEYS[template.factSource]
            : undefined;
    const source =
        template.factSource != null
            ? sourceKey != null
                ? t(sourceKey)
                : template.factSource
            : null;
    const label = localizedText(template.label);
    const description = localizedText(template.description);

    return (
        <button
            className="palette-item"
            draggable={true}
            onClick={() => onAdd(kind, template)}
            onDragStart={(event) => {
                const payload: IMpcPolicyEditorDragPayload = {
                    kind,
                    template: template.id,
                    policyId: template.params.find(
                        (param) => param.type === 'policy_ref',
                    )?.default as string | undefined,
                };
                event.dataTransfer.setData(
                    MPC_POLICY_EDITOR_DRAG_TYPE,
                    JSON.stringify(payload),
                );
                event.dataTransfer.effectAllowed = 'move';
            }}
            title={
                localizedText(template.factSourceNote) || description || label
            }
            type="button"
        >
            <div className="pi-label">{label}</div>
            {description.length > 0 && (
                <div className="pi-desc">{description}</div>
            )}
            <span
                className={classNames(
                    'badge-class',
                    template.class === 'effectful' ? 'badge-eff' : 'badge-det',
                )}
            >
                {t(
                    template.class === 'effectful'
                        ? 'app.mpc.mpcPolicyEditor.palette.effectful'
                        : 'app.mpc.mpcPolicyEditor.palette.deterministic',
                )}
            </span>
            {source != null && (
                <span className="badge-class badge-src">{source}</span>
            )}
        </button>
    );
};

/**
 * Left sidebar of the editor: the catalog blocks (conditions grouped by catalog group, then actions).
 */
export const MpcPolicyEditorPalette: React.FC<IMpcPolicyEditorPaletteProps> = (
    props,
) => {
    const {
        conditionGroups,
        conditions,
        actions,
        workspacePolicies,
        currentPolicyId,
        onAdd,
    } = props;
    const { t } = useTranslations();
    const policyBlocks = (workspacePolicies ?? []).filter(
        (policy) => policy.id !== currentPolicyId,
    );

    const byGroup = new Map<string, IMpcPolicyCatalogTemplate[]>();

    for (const condition of conditions) {
        const group = condition.group ?? 'other';
        byGroup.set(group, [...(byGroup.get(group) ?? []), condition]);
    }

    const groupKeys = [
        ...GROUP_ORDER.filter((group) => byGroup.has(group)),
        ...[...byGroup.keys()].filter((group) => !GROUP_ORDER.includes(group)),
    ];

    return (
        <aside className="sidebar">
            <div className="palette-group">
                <div className="section-title">
                    {t('app.mpc.mpcPolicyEditor.palette.conditions')}
                </div>
                {groupKeys.map((group) => {
                    const meta = conditionGroups?.[group];
                    const title =
                        meta != null
                            ? localizedText(meta.label)
                            : group === 'other'
                              ? t('app.mpc.mpcPolicyEditor.palette.groupOther')
                              : group;
                    const description =
                        meta != null ? localizedText(meta.description) : '';

                    return (
                        <div className="palette-subgroup" key={group}>
                            <div
                                className={classNames(
                                    'subgroup-title',
                                    `subgroup-${group}`,
                                )}
                            >
                                {title}
                            </div>
                            {description.length > 0 && (
                                <p className="subgroup-desc">{description}</p>
                            )}
                            {byGroup.get(group)!.map((condition) => (
                                <PaletteItem
                                    key={condition.id}
                                    kind="condition"
                                    onAdd={onAdd}
                                    template={condition}
                                />
                            ))}
                        </div>
                    );
                })}
            </div>
            <div className="palette-group">
                <div className="section-title">
                    {t('app.mpc.mpcPolicyEditor.palette.actions')}
                </div>
                {actions.map((action) => (
                    <PaletteItem
                        key={action.id}
                        kind="action"
                        onAdd={onAdd}
                        template={action}
                    />
                ))}
            </div>
            {policyBlocks.length > 0 && (
                <div className="palette-group">
                    <div className="section-title">
                        {t('app.mpc.mpcPolicyEditor.palette.policies')}
                    </div>
                    <p className="subgroup-desc">
                        {t(
                            'app.mpc.mpcPolicyEditor.palette.policiesDescription',
                        )}
                    </p>
                    {policyBlocks.map((policy) => (
                        <PaletteItem
                            key={policy.id}
                            kind="action"
                            onAdd={onAdd}
                            template={policyRefTemplate(policy, t)}
                        />
                    ))}
                </div>
            )}
            <div className="palette-group">
                <p className="hint">
                    {t('app.mpc.mpcPolicyEditor.palette.hint', {
                        yes: t('app.mpc.mpcPolicyEditor.yes'),
                        no: t('app.mpc.mpcPolicyEditor.no'),
                    })}
                </p>
            </div>
        </aside>
    );
};
