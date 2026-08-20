'use client';

import '@xyflow/react/dist/style.css';
import './mpcPolicyEditor.css';
import {
    Background,
    BackgroundVariant,
    type Connection,
    Controls,
    type Edge,
    MiniMap,
    type NodeTypes,
    ReactFlow,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
    useReactFlow,
} from '@xyflow/react';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    MpcApiError,
    useMpcCheckPolicyFlow,
    useMpcCreateWorkspacePolicy,
    useMpcSimulatePolicyFlow,
    useMpcUpdateWorkspacePolicy,
} from '@/modules/mpc/api/mpcService';
import type {
    IMpcPolicyCatalogResponse,
    IMpcPolicyCatalogTemplate,
    IMpcPolicyCheckResult,
    IMpcPolicyFlow,
    IMpcPolicySimContext,
    IMpcPolicySimResult,
    IMpcWorkspacePolicy,
} from '@/modules/mpc/api/mpcService/domain';
import { getMpcErrorMessage } from '@/modules/mpc/components/mpcErrorAlert';
import { useTranslations } from '@/shared/components/translationsProvider';
import { MpcPolicyEditorCheckPanel } from './mpcPolicyEditorCheckPanel';
import { MpcPolicyEditorInspector } from './mpcPolicyEditorInspector';
import { mpcPolicyEditorNodeTypes } from './mpcPolicyEditorNodes';
import type { IMpcPolicyEditorDragPayload } from './mpcPolicyEditorPalette';
import {
    MPC_POLICY_EDITOR_DRAG_TYPE,
    type MpcPolicyEditorBlockKind,
    MpcPolicyEditorPalette,
} from './mpcPolicyEditorPalette';
import { MpcPolicyEditorSimPanel } from './mpcPolicyEditorSimPanel';
import { localizedText } from './mpcPolicyEditorText';
import {
    applyCheckOverlay,
    applySimulationOverlay,
    branchLabel,
    defaultParams,
    EMPTY_POLICY_FLOW,
    edgeStyleFor,
    flowToReactFlow,
    indexCatalog,
    layoutFlow,
    MPC_POLICY_REF_TEMPLATE,
    type MpcPolicyEditorNode,
    paramSummary,
    policyRefTemplate,
    reactFlowToFlow,
    templateLabelFor,
} from './mpcPolicyEditorUtils';

export interface IMpcPolicyEditorProps {
    /**
     * Workspace the policy belongs to.
     */
    workspaceId: string;
    /**
     * Effective block catalog (from the policy engine, via the co-signer API).
     */
    catalog: IMpcPolicyCatalogResponse;
    /**
     * Existing policy to edit; undefined creates a new policy.
     */
    policy?: IMpcWorkspacePolicy;
    /**
     * Saved policies of the workspace, usable as policy blocks inside the flow.
     */
    workspacePolicies?: IMpcWorkspacePolicy[];
    /**
     * Whether the current user can save (workspace owner).
     */
    canEdit: boolean;
    /**
     * Callback called after a successful save (create or update).
     */
    onSaved?: (policy: IMpcWorkspacePolicy) => void;
    /**
     * Additional classes for the wrapper.
     */
    className?: string;
}

const nodeTypes = mpcPolicyEditorNodeTypes as unknown as NodeTypes;

const MpcPolicyEditorInner: React.FC<IMpcPolicyEditorProps> = (props) => {
    const {
        workspaceId,
        catalog,
        policy,
        workspacePolicies,
        canEdit,
        onSaved,
    } = props;
    const { t } = useTranslations();

    const catalogIndex = useMemo(
        () => indexCatalog(catalog.conditions, catalog.actions),
        [catalog.conditions, catalog.actions],
    );
    const policyBlocks = useMemo(
        () =>
            (workspacePolicies ?? []).filter((item) => item.id !== policy?.id),
        [workspacePolicies, policy?.id],
    );
    const policyNames = useMemo(
        () => new Map(policyBlocks.map((item) => [item.id, item.name])),
        [policyBlocks],
    );
    // Resolves the template of a block: catalog blocks by id, policy blocks by the referenced policy.
    const resolveTemplate = useCallback(
        (
            kind: MpcPolicyEditorBlockKind,
            template: string,
            policyId?: string,
        ): IMpcPolicyCatalogTemplate | undefined => {
            if (template === MPC_POLICY_REF_TEMPLATE) {
                const referenced = policyBlocks.find(
                    (item) => item.id === policyId,
                );

                return referenced != null
                    ? policyRefTemplate(referenced, t)
                    : undefined;
            }

            return kind === 'action'
                ? catalogIndex.actions.get(template)
                : catalogIndex.conditions.get(template);
        },
        [policyBlocks, catalogIndex, t],
    );
    // Query param of check / simulate: the policy being edited cannot be referenced by itself.
    const flowQueryParams = useMemo(
        () => (policy != null ? { policyId: policy.id } : undefined),
        [policy],
    );
    const initialFlow = useMemo<IMpcPolicyFlow>(
        () => policy?.flow ?? EMPTY_POLICY_FLOW,
        [policy],
    );
    // Initial state only: later edits go through the React Flow state.
    // biome-ignore lint/correctness/useExhaustiveDependencies: t is stable, the initial canvas must not be rebuilt on every render
    const initial = useMemo(
        () => flowToReactFlow(initialFlow, catalogIndex, t, policyNames),
        [initialFlow, catalogIndex],
    );

    const [nodes, setNodes, onNodesChange] = useNodesState<MpcPolicyEditorNode>(
        initial.nodes,
    );
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initial.edges);
    const [name, setName] = useState(
        policy?.name ?? localizedText(initialFlow.name) ?? '',
    );
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [simResult, setSimResult] = useState<IMpcPolicySimResult | null>(
        null,
    );
    const [simError, setSimError] = useState<string | null>(null);
    const [checkResult, setCheckResult] =
        useState<IMpcPolicyCheckResult | null>(null);
    const [checkError, setCheckError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const idCounter = useRef(1);
    const { screenToFlowPosition, fitView } = useReactFlow();

    const simulateMutation = useMpcSimulatePolicyFlow();
    const checkMutation = useMpcCheckPolicyFlow();
    const createMutation = useMpcCreateWorkspacePolicy({
        onSuccess: (saved) => {
            setSaveSuccess(true);
            onSaved?.(saved);
        },
    });
    const updateMutation = useMpcUpdateWorkspacePolicy({
        onSuccess: (saved) => {
            setSaveSuccess(true);
            onSaved?.(saved);
        },
    });

    const clearSimulation = useCallback(() => {
        setSimResult(null);
        setSimError(null);
        setNodes((current) =>
            applySimulationOverlay(current as MpcPolicyEditorNode[], null),
        );
    }, [setNodes]);

    const clearCheck = useCallback(() => {
        setCheckResult(null);
        setCheckError(null);
        setNodes((current) =>
            applyCheckOverlay(current as MpcPolicyEditorNode[], null),
        );
    }, [setNodes]);

    // Any edit of the graph invalidates the simulation, the check and the "saved" state.
    const clearAnalyses = useCallback(() => {
        clearSimulation();
        clearCheck();
        setSaveSuccess(false);
        setSaveError(null);
    }, [clearSimulation, clearCheck]);

    const uniqueId = useCallback(
        (base: string) => {
            const existing = new Set(nodes.map((node) => node.id));
            let id = `${base}_${(idCounter.current++).toString()}`;

            while (existing.has(id)) {
                id = `${base}_${(idCounter.current++).toString()}`;
            }

            return id;
        },
        [nodes],
    );

    const addNodeAt = useCallback(
        (
            kind: MpcPolicyEditorBlockKind,
            template: IMpcPolicyCatalogTemplate,
            position: { x: number; y: number },
        ) => {
            const id = uniqueId(template.id);
            const params = defaultParams(template);
            const node: MpcPolicyEditorNode = {
                id,
                type: kind,
                position,
                data: {
                    kind,
                    template: template.id,
                    templateLabel: templateLabelFor(
                        catalogIndex,
                        kind,
                        template.id,
                        t,
                    ),
                    isEffectful: template.class === 'effectful',
                    params,
                    paramSummary: paramSummary(
                        kind,
                        template.id,
                        params,
                        catalogIndex,
                        t,
                        policyNames,
                    ),
                },
            };
            setNodes((current) => [...current, node]);
            setSelectedId(id);
            clearAnalyses();
        },
        [uniqueId, catalogIndex, t, policyNames, setNodes, clearAnalyses],
    );

    const addNodeCentered = useCallback(
        (
            kind: MpcPolicyEditorBlockKind,
            template: IMpcPolicyCatalogTemplate,
        ) => {
            const rect = wrapperRef.current?.getBoundingClientRect();
            const position =
                rect != null
                    ? screenToFlowPosition({
                          x: rect.left + rect.width / 2,
                          y: rect.top + rect.height / 3,
                      })
                    : { x: 240, y: 160 };
            addNodeAt(kind, template, position);
        },
        [screenToFlowPosition, addNodeAt],
    );

    const onConnect = useCallback(
        (connection: Connection) => {
            if (
                !connection.source ||
                !connection.target ||
                connection.source === connection.target
            ) {
                return;
            }

            setEdges((current) => {
                // A source handle has exactly one output: replace the previous edge.
                const filtered = current.filter(
                    (edge) =>
                        !(
                            edge.source === connection.source &&
                            edge.sourceHandle === connection.sourceHandle
                        ),
                );
                const newEdge: Edge = {
                    id: `e_${connection.source}_${connection.sourceHandle ?? 'out'}_${connection.target}_${Date.now().toString()}`,
                    source: connection.source,
                    target: connection.target,
                    sourceHandle: connection.sourceHandle ?? undefined,
                    targetHandle: connection.targetHandle ?? undefined,
                    label: branchLabel(connection.sourceHandle, t),
                    ...edgeStyleFor(connection.sourceHandle),
                };

                return [...filtered, newEdge];
            });
            clearAnalyses();
        },
        [setEdges, clearAnalyses, t],
    );

    const updateNodeParams = useCallback(
        (nodeId: string, params: Record<string, unknown>) => {
            setNodes((current) =>
                (current as MpcPolicyEditorNode[]).map((node) =>
                    node.id === nodeId
                        ? {
                              ...node,
                              data: {
                                  ...node.data,
                                  params,
                                  paramSummary: paramSummary(
                                      node.data.kind,
                                      node.data.template,
                                      params,
                                      catalogIndex,
                                      t,
                                      policyNames,
                                  ),
                              },
                          }
                        : node,
                ),
            );
            clearAnalyses();
        },
        [setNodes, catalogIndex, t, policyNames, clearAnalyses],
    );

    // Policy names may arrive / change after the canvas is built: refresh the policy-block labels.
    useEffect(() => {
        setNodes((current) =>
            (current as MpcPolicyEditorNode[]).map((node) =>
                node.data.template === MPC_POLICY_REF_TEMPLATE
                    ? {
                          ...node,
                          data: {
                              ...node.data,
                              paramSummary: paramSummary(
                                  node.data.kind,
                                  node.data.template,
                                  node.data.params,
                                  catalogIndex,
                                  t,
                                  policyNames,
                              ),
                          },
                      }
                    : node,
            ),
        );
    }, [policyNames, catalogIndex, t, setNodes]);

    const deleteNode = useCallback(
        (nodeId: string) => {
            setNodes((current) => current.filter((node) => node.id !== nodeId));
            setEdges((current) =>
                current.filter(
                    (edge) => edge.source !== nodeId && edge.target !== nodeId,
                ),
            );

            if (selectedId === nodeId) {
                setSelectedId(null);
            }

            clearAnalyses();
        },
        [setNodes, setEdges, selectedId, clearAnalyses],
    );

    const currentFlow = useCallback(
        () =>
            reactFlowToFlow(
                nodes as MpcPolicyEditorNode[],
                edges,
                name.trim() || undefined,
            ),
        [nodes, edges, name],
    );

    const runSimulation = useCallback(
        (context: IMpcPolicySimContext) => {
            setSimError(null);
            simulateMutation.mutate(
                {
                    urlParams: { workspaceId },
                    queryParams: flowQueryParams,
                    body: { flow: currentFlow(), context },
                },
                {
                    onSuccess: (result) => {
                        setSimResult(result);
                        setNodes((current) =>
                            applySimulationOverlay(
                                current as MpcPolicyEditorNode[],
                                result,
                            ),
                        );
                    },
                    onError: (error) => {
                        setSimResult(null);
                        setSimError(getMpcErrorMessage(error));
                        setNodes((current) =>
                            applySimulationOverlay(
                                current as MpcPolicyEditorNode[],
                                null,
                            ),
                        );
                    },
                },
            );
        },
        [simulateMutation, workspaceId, flowQueryParams, currentFlow, setNodes],
    );

    // dagre only knows an ESTIMATED size of each node before the first render: once React Flow has measured
    // the real nodes, re-run the layout once so blocks never overlap.
    const [pendingAutoLayout, setPendingAutoLayout] = useState(true);
    const autoLayoutRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (!pendingAutoLayout) {
            return;
        }

        const current = nodes as MpcPolicyEditorNode[];

        if (current.length === 0) {
            return;
        }

        const allMeasured = current.every(
            (node) =>
                (node.measured?.width ?? 0) > 0 &&
                (node.measured?.height ?? 0) > 0,
        );

        if (!allMeasured) {
            return;
        }

        setPendingAutoLayout(false);
        autoLayoutRef.current?.();
    }, [nodes, pendingAutoLayout]);

    const autoLayout = useCallback(() => {
        setNodes((current) => {
            const typed = current as MpcPolicyEditorNode[];
            const flow = reactFlowToFlow(typed, edges);
            const sizes = new Map<string, { width: number; height: number }>();

            for (const node of typed) {
                const width = node.measured?.width ?? node.width;
                const height = node.measured?.height ?? node.height;

                if (width && height) {
                    sizes.set(node.id, { width, height });
                }
            }

            const positions = layoutFlow(flow, sizes);

            return typed.map((node) =>
                positions.has(node.id)
                    ? { ...node, position: positions.get(node.id)! }
                    : node,
            );
        });
        window.setTimeout(
            () => void fitView({ padding: 0.15, duration: 300 }),
            50,
        );
    }, [edges, setNodes, fitView]);
    autoLayoutRef.current = autoLayout;

    const runCheck = useCallback(() => {
        setCheckError(null);
        setCheckResult(null);
        setNodes((current) =>
            applyCheckOverlay(current as MpcPolicyEditorNode[], null),
        );
        checkMutation.mutate(
            {
                urlParams: { workspaceId },
                queryParams: flowQueryParams,
                body: { flow: currentFlow() },
            },
            {
                onSuccess: (result) => {
                    setCheckResult(result);
                    setNodes((current) =>
                        applyCheckOverlay(
                            current as MpcPolicyEditorNode[],
                            result,
                        ),
                    );
                },
                onError: (error) => setCheckError(getMpcErrorMessage(error)),
            },
        );
    }, [checkMutation, workspaceId, flowQueryParams, currentFlow, setNodes]);

    const loadFlow = useCallback(
        (flow: IMpcPolicyFlow) => {
            const fresh = flowToReactFlow(flow, catalogIndex, t, policyNames);
            setNodes(fresh.nodes);
            setEdges(fresh.edges);

            if (policy == null) {
                setName(localizedText(flow.name));
            }

            setPendingAutoLayout(true);
            setSelectedId(null);
            clearAnalyses();
        },
        [
            catalogIndex,
            t,
            policyNames,
            setNodes,
            setEdges,
            policy,
            clearAnalyses,
        ],
    );

    const isSaving = createMutation.isPending || updateMutation.isPending;
    const canSave =
        canEdit &&
        !isSaving &&
        !checkMutation.isPending &&
        checkResult?.consistent === true &&
        name.trim().length > 0;

    const save = useCallback(() => {
        setSaveError(null);
        setSaveSuccess(false);
        const flow = currentFlow();
        const body = { name: name.trim(), flow };
        const options = {
            onError: (error: unknown) => {
                setSaveError(
                    MpcApiError.isMpcApiError(error)
                        ? error.message
                        : getMpcErrorMessage(error),
                );
            },
        };

        if (policy != null) {
            updateMutation.mutate(
                {
                    urlParams: { workspaceId, policyId: policy.id },
                    body,
                },
                options,
            );
        } else {
            createMutation.mutate(
                { urlParams: { workspaceId }, body },
                options,
            );
        }
    }, [
        currentFlow,
        name,
        policy,
        workspaceId,
        updateMutation,
        createMutation,
    ]);

    const downloadJson = useCallback(() => {
        const json = JSON.stringify(currentFlow(), null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${(name.trim() || 'policy').replace(/[^a-z0-9-_]+/gi, '_')}.flow.json`;
        anchor.click();
        URL.revokeObjectURL(url);
    }, [currentFlow, name]);

    const nodeMeta = useMemo(() => {
        const meta = new Map<string, { kind: string; template?: string }>();

        for (const node of nodes as MpcPolicyEditorNode[]) {
            meta.set(node.id, {
                kind: node.data.kind,
                template: node.data.template,
            });
        }

        return meta;
    }, [nodes]);

    const selectedNode = nodes.find((node) => node.id === selectedId) as
        | MpcPolicyEditorNode
        | undefined;
    const selectedTemplate =
        selectedNode?.data.template != null &&
        selectedNode.data.kind !== 'trigger'
            ? resolveTemplate(
                  selectedNode.data.kind,
                  selectedNode.data.template,
                  String(selectedNode.data.params.policyId ?? ''),
              )
            : undefined;

    const availableExamples = catalog.examples;
    const checkStatus = checkMutation.isPending
        ? 'checking'
        : checkResult == null
          ? 'unchecked'
          : checkResult.consistent
            ? 'verified'
            : 'failed';

    return (
        <div className="app-shell">
            <header className="topbar">
                <span className="brand-dot" />
                <div className="field" style={{ margin: 0, minWidth: 260 }}>
                    <input
                        aria-label={t(
                            'app.mpc.mpcPolicyEditor.toolbar.nameLabel',
                        )}
                        disabled={!canEdit}
                        onChange={(event) => {
                            setName(event.target.value);
                            setSaveSuccess(false);
                        }}
                        placeholder={t(
                            'app.mpc.mpcPolicyEditor.toolbar.namePlaceholder',
                        )}
                        type="text"
                        value={name}
                    />
                </div>
                <span
                    className={classNames('badge-class', {
                        'badge-det': checkStatus === 'verified',
                        'badge-eff': checkStatus !== 'verified',
                    })}
                    style={{ marginTop: 0 }}
                >
                    {t(`app.mpc.mpcPolicyEditor.toolbar.status.${checkStatus}`)}
                </span>
                <div className="spacer" />
                <div className="toolbar">
                    <select
                        className="btn btn-select"
                        disabled={!canEdit}
                        onChange={(event) => {
                            const example =
                                availableExamples[Number(event.target.value)];
                            event.currentTarget.value = '';

                            if (example?.flow != null) {
                                loadFlow(example.flow);
                            }
                        }}
                        title={t(
                            'app.mpc.mpcPolicyEditor.toolbar.examplesTitle',
                        )}
                        value=""
                    >
                        <option disabled={true} value="">
                            {t('app.mpc.mpcPolicyEditor.toolbar.examples')}
                        </option>
                        {availableExamples.map((example) => (
                            <option
                                disabled={!example.available}
                                key={example.index}
                                value={example.index}
                            >
                                {localizedText(example.name) ||
                                    t(
                                        'app.mpc.mpcPolicyEditor.toolbar.exampleN',
                                        {
                                            n: example.index + 1,
                                        },
                                    )}
                                {example.available
                                    ? ''
                                    : t(
                                          'app.mpc.mpcPolicyEditor.toolbar.exampleUnavailable',
                                      )}
                            </option>
                        ))}
                    </select>
                    <button
                        className="btn"
                        onClick={autoLayout}
                        title={t(
                            'app.mpc.mpcPolicyEditor.toolbar.arrangeTitle',
                        )}
                        type="button"
                    >
                        {t('app.mpc.mpcPolicyEditor.toolbar.arrange')}
                    </button>
                    <button
                        className="btn btn-primary"
                        disabled={checkMutation.isPending}
                        onClick={runCheck}
                        title={t('app.mpc.mpcPolicyEditor.toolbar.checkTitle')}
                        type="button"
                    >
                        {t(
                            checkMutation.isPending
                                ? 'app.mpc.mpcPolicyEditor.toolbar.checking'
                                : 'app.mpc.mpcPolicyEditor.toolbar.check',
                        )}
                    </button>
                    {canEdit && (
                        <button
                            className="btn btn-primary"
                            disabled={!canSave}
                            onClick={save}
                            title={t(
                                canSave
                                    ? 'app.mpc.mpcPolicyEditor.toolbar.saveTitle'
                                    : 'app.mpc.mpcPolicyEditor.toolbar.saveDisabledTitle',
                            )}
                            type="button"
                        >
                            {t(
                                isSaving
                                    ? 'app.mpc.mpcPolicyEditor.toolbar.saving'
                                    : 'app.mpc.mpcPolicyEditor.toolbar.save',
                            )}
                        </button>
                    )}
                    <button
                        className="btn"
                        onClick={downloadJson}
                        title={t('app.mpc.mpcPolicyEditor.toolbar.exportTitle')}
                        type="button"
                    >
                        {t('app.mpc.mpcPolicyEditor.toolbar.export')}
                    </button>
                </div>
            </header>

            <div className="workspace">
                <MpcPolicyEditorPalette
                    actions={catalog.actions}
                    conditionGroups={catalog.groups}
                    conditions={catalog.conditions}
                    currentPolicyId={policy?.id}
                    onAdd={addNodeCentered}
                    workspacePolicies={workspacePolicies}
                />

                {/* biome-ignore lint/a11y/noStaticElementInteractions: drop target of the palette blocks (click-to-add is the keyboard path) */}
                {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: drop target of the palette blocks (click-to-add is the keyboard path) */}
                <div
                    className="canvas"
                    onDragOver={(event) => {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(event) => {
                        event.preventDefault();
                        const raw = event.dataTransfer.getData(
                            MPC_POLICY_EDITOR_DRAG_TYPE,
                        );

                        if (!raw) {
                            return;
                        }

                        const { kind, template, policyId } = JSON.parse(
                            raw,
                        ) as IMpcPolicyEditorDragPayload;
                        const catalogTemplate = resolveTemplate(
                            kind,
                            template,
                            policyId,
                        );

                        if (catalogTemplate == null) {
                            return;
                        }

                        addNodeAt(
                            kind,
                            catalogTemplate,
                            screenToFlowPosition({
                                x: event.clientX,
                                y: event.clientY,
                            }),
                        );
                    }}
                    ref={wrapperRef}
                >
                    <ReactFlow
                        deleteKeyCode={['Backspace', 'Delete']}
                        edges={edges}
                        fitView={true}
                        fitViewOptions={{ padding: 0.2 }}
                        nodes={nodes}
                        nodeTypes={nodeTypes}
                        onConnect={onConnect}
                        onEdgesChange={(changes) => {
                            onEdgesChange(changes);

                            if (
                                changes.some(
                                    (change) => change.type === 'remove',
                                )
                            ) {
                                clearAnalyses();
                            }
                        }}
                        onNodeClick={(_, node) => setSelectedId(node.id)}
                        onNodesChange={(changes) => {
                            onNodesChange(changes);

                            if (
                                changes.some(
                                    (change) => change.type === 'remove',
                                )
                            ) {
                                clearAnalyses();
                            }
                        }}
                        onPaneClick={() => setSelectedId(null)}
                        proOptions={{ hideAttribution: true }}
                    >
                        <Background
                            color="#cbd2d9"
                            gap={20}
                            size={1}
                            variant={BackgroundVariant.Dots}
                        />
                        <Controls showInteractive={false} />
                        <MiniMap
                            nodeColor={(node) => {
                                const kind = (node.data as { kind?: string })
                                    .kind;

                                if (kind === 'trigger') {
                                    return '#93b2ff';
                                }

                                if (kind === 'action') {
                                    return '#cbd2d9';
                                }

                                return '#628cfe';
                            }}
                            pannable={true}
                            zoomable={true}
                        />
                    </ReactFlow>
                </div>

                <aside className="rightbar">
                    {saveSuccess && (
                        <div className="check-banner ok">
                            <div className="cb-title">
                                {t('app.mpc.mpcPolicyEditor.save.successTitle')}
                            </div>
                            <div className="cb-sub">
                                {t(
                                    'app.mpc.mpcPolicyEditor.save.successDescription',
                                )}
                            </div>
                        </div>
                    )}
                    {saveError != null && (
                        <div className="issue-card error">
                            <div className="ic-head">
                                <span className="ic-tag">
                                    {t('app.mpc.mpcPolicyEditor.error')}
                                </span>
                                <span className="ic-title">
                                    {t('app.mpc.mpcPolicyEditor.save.failed')}
                                </span>
                            </div>
                            <div className="ic-msg">{saveError}</div>
                        </div>
                    )}
                    {(checkMutation.isPending ||
                        checkError != null ||
                        checkResult != null) && (
                        <MpcPolicyEditorCheckPanel
                            catalogIndex={catalogIndex}
                            error={checkError}
                            isChecking={checkMutation.isPending}
                            nodeMeta={nodeMeta}
                            result={checkResult}
                        />
                    )}
                    {selectedNode != null && (
                        <MpcPolicyEditorInspector
                            kindFamilies={catalog.kindFamilies}
                            node={selectedNode}
                            onChange={updateNodeParams}
                            onDelete={deleteNode}
                            policyOptions={policyBlocks}
                            template={selectedTemplate}
                        />
                    )}
                    <MpcPolicyEditorSimPanel
                        isSimulating={simulateMutation.isPending}
                        onClear={clearSimulation}
                        onSimulate={runSimulation}
                        result={simResult}
                    />
                    {simError != null && (
                        <div className="decision-card decision-deny">
                            <div className="dc-kicker">
                                {t('app.mpc.mpcPolicyEditor.sim.error')}
                            </div>
                            <div className="dc-detail" style={{ marginTop: 6 }}>
                                {simError}
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};

/**
 * Visual policy editor: compose a decision tree from catalog blocks, simulate a sample transaction, run the
 * formal check and save the policy at workspace level (only flows passing the check can be saved).
 */
export const MpcPolicyEditor: React.FC<IMpcPolicyEditorProps> = (props) => {
    const { className, ...otherProps } = props;

    return (
        <div className={classNames('mpc-policy-editor', className)}>
            <ReactFlowProvider>
                <MpcPolicyEditorInner {...otherProps} />
            </ReactFlowProvider>
        </div>
    );
};
