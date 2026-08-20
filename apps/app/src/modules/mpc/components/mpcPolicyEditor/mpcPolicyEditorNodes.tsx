'use client';

import { Handle, type NodeProps, Position } from '@xyflow/react';
import classNames from 'classnames';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    actionDotClass,
    type IMpcPolicyEditorNodeData,
    MPC_POLICY_REF_TEMPLATE,
} from './mpcPolicyEditorUtils';

/**
 * Canvas nodes of the policy editor: trigger (entry), condition (two outputs: yes / no) and action (leaf).
 * The data is cast from the generic NodeProps to avoid React Flow generic variance friction.
 */

const simClass = (sim?: IMpcPolicyEditorNodeData['sim']): string =>
    sim != null ? `sim-${sim}` : '';

const checkClass = (check?: IMpcPolicyEditorNodeData['check']): string =>
    check != null ? `check-${check}` : '';

const NodeParams: React.FC<{ data: IMpcPolicyEditorNodeData }> = ({ data }) => {
    if (data.paramSummary.length === 0) {
        return null;
    }

    return (
        <div className="rf-params">
            {data.paramSummary.map((summary) => (
                <div key={summary}>{summary}</div>
            ))}
        </div>
    );
};

export const MpcPolicyEditorTriggerNode: React.FC<NodeProps> = (props) => {
    const { t } = useTranslations();
    const data = props.data as unknown as IMpcPolicyEditorNodeData;

    return (
        <div
            className={classNames(
                'rf-node node-trigger',
                { selected: props.selected },
                simClass(data.sim),
                checkClass(data.check),
            )}
        >
            <div className="rf-head">
                <span className="icon-dot dot-primary" />
                <span className="rf-kind">
                    {t('app.mpc.mpcPolicyEditor.node.trigger')}
                </span>
            </div>
            <div className="rf-title">{data.templateLabel}</div>
            <Handle
                className="rf-handle"
                id="out"
                position={Position.Right}
                type="source"
            />
        </div>
    );
};

export const MpcPolicyEditorConditionNode: React.FC<NodeProps> = (props) => {
    const { t } = useTranslations();
    const data = props.data as unknown as IMpcPolicyEditorNodeData;
    const yesLabel = t('app.mpc.mpcPolicyEditor.yes');
    const noLabel = t('app.mpc.mpcPolicyEditor.no');

    return (
        <div
            className={classNames(
                'rf-node node-condition',
                { selected: props.selected },
                simClass(data.sim),
                checkClass(data.check),
            )}
        >
            <Handle
                className="rf-handle"
                id="in"
                position={Position.Left}
                type="target"
            />
            <div className="rf-head">
                <span className="icon-dot dot-primary" />
                <span className="rf-kind">
                    {t('app.mpc.mpcPolicyEditor.node.condition')}
                    {data.isEffectful
                        ? t('app.mpc.mpcPolicyEditor.node.externalFact')
                        : ''}
                </span>
            </div>
            <div className="rf-title">{data.templateLabel}</div>
            <NodeParams data={data} />
            {data.branchTaken != null && (
                <span
                    className={classNames(
                        'rf-branch-tag',
                        data.branchTaken === 'true' ? 'tag-true' : 'tag-false',
                    )}
                    title={data.simNote}
                >
                    {t('app.mpc.mpcPolicyEditor.node.branch', {
                        branch:
                            data.branchTaken === 'true' ? yesLabel : noLabel,
                    })}
                    {data.simNote != null
                        ? t('app.mpc.mpcPolicyEditor.node.notApplicable')
                        : ''}
                </span>
            )}
            <Handle
                className="rf-handle handle-true"
                id="true"
                position={Position.Right}
                style={{ top: '38%' }}
                type="source"
            />
            <span className="handle-label" style={{ right: -28, top: '31%' }}>
                {yesLabel}
            </span>
            <Handle
                className="rf-handle handle-false"
                id="false"
                position={Position.Right}
                style={{ top: '72%' }}
                type="source"
            />
            <span className="handle-label" style={{ right: -28, top: '65%' }}>
                {noLabel}
            </span>
        </div>
    );
};

export const MpcPolicyEditorActionNode: React.FC<NodeProps> = (props) => {
    const { t } = useTranslations();
    const data = props.data as unknown as IMpcPolicyEditorNodeData;
    const isPolicyRef = data.template === MPC_POLICY_REF_TEMPLATE;

    return (
        <div
            className={classNames(
                'rf-node node-action',
                { selected: props.selected, 'node-policy-ref': isPolicyRef },
                simClass(data.sim),
                checkClass(data.check),
            )}
        >
            <Handle
                className="rf-handle"
                id="in"
                position={Position.Left}
                type="target"
            />
            <div className="rf-head">
                <span
                    className={classNames(
                        'icon-dot',
                        actionDotClass(data.template),
                    )}
                />
                <span className="rf-kind">
                    {t(
                        isPolicyRef
                            ? 'app.mpc.mpcPolicyEditor.node.policyRef'
                            : 'app.mpc.mpcPolicyEditor.node.action',
                    )}
                    {data.isEffectful
                        ? t('app.mpc.mpcPolicyEditor.node.effectful')
                        : ''}
                </span>
            </div>
            <div className="rf-title">{data.templateLabel}</div>
            <NodeParams data={data} />
        </div>
    );
};

export const mpcPolicyEditorNodeTypes = {
    trigger: MpcPolicyEditorTriggerNode,
    condition: MpcPolicyEditorConditionNode,
    action: MpcPolicyEditorActionNode,
};
