import { daoService } from '@/shared/api/daoService/daoService';
import { NextRequest, NextResponse } from 'next/server';
import { resolveAddress } from './resolver';

// Types for the graph data
type NodeType = 'DAO' | 'SUBDAO' | 'PLUGIN' | 'ROUTER' | 'CONTRACT' | 'WALLET';

interface Node {
    id: string;
    label: string;
    type: NodeType;
    address: string;
    metadata?: Record<string, any>;
}

interface Edge {
    id: string;
    source: string;
    target: string;
    label?: string;
    type: 'CALL' | 'TOKEN';
    data?: any;
}

interface GraphData {
    nodes: Node[];
    edges: Edge[];
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const txHash = searchParams.get('tx');

    if (!txHash) {
        return NextResponse.json({ error: 'Missing tx query parameter' }, { status: 400 });
    }

    try {
        // 1. Get RPC URL for Sepolia
        // Strategy: Use Tenderly API as requested for cleaner traces
        const tenderlyKey = process.env.NEXT_SECRET_TENDERLY_KEY;
        if (!tenderlyKey) {
            return NextResponse.json({ error: 'Missing NEXT_SECRET_TENDERLY_KEY for Tenderly' }, { status: 500 });
        }

        // Sepolia Chain ID: 11155111
        const chainId = '11155111';
        const tenderlyUrl = `https://api.tenderly.co/api/v1/public-contract/${chainId}/trace/${txHash}`;

        console.log(`Fetching trace from Tenderly API: ${tenderlyUrl}`);

        const response = await fetch(tenderlyUrl, {
            method: 'GET', // REST API uses GET usually
            headers: {
                'Content-Type': 'application/json',
                'X-Access-Key': tenderlyKey,
            },
        });

        if (!response.ok) {
            throw new Error(`Tenderly API HTTP ${response.status} - ${response.statusText}`);
        }

        const traceResult = await response.json();

        // DEBUG: Log the raw response to understand structure
        console.log('Tenderly Response:', JSON.stringify(traceResult, null, 2));

        // Tenderly API structure is different from debug_traceTransaction.
        // Needs normalization adaptation.
        // For now, let's return the raw result to inspect or try to adapt if standard fields exist.
        // If it returns a list of traces (flat), we need a different processor.

        // Adapting to common Tenderly format (flat array of logs/traces?)
        // Let's assume for this step we mostly want to see the log to fix the parser next.
        // However, to avoid breaking the frontend completely, I'll pass it to processTrace ONLY if it matches the recursive structure.
        // If it's a flat array, I might need to rebuild the tree.

        // If traceResult is standard Tenderly, it might have `call_trace` or similar keys.
        // Let's check typical response: { "calls": [...] } or { "logs": [...] }

        // For the sake of the "debug" step requested by user previously, I leave it logging.
        // But I will try to map it if it looks like the standard callTracer.
        // If not, I'll return the raw data in a specific way or handle the error gracefully.

        if (!traceResult) {
            return NextResponse.json({ error: `Empty result from Tenderly` }, { status: 500 });
        }

        // 3. Normalize Data
        // Tenderly returns: { asset_changes: [...], logs: [...], ... }
        // asset_changes has: { from, to, amount, token_info: { symbol, name, ... }, type }
        // This is PERFECT for capital flow visualization!

        // We keep a single metadata map for plugins and policies so lookups are easy
        // when we enrich nodes later.
        const pluginMetadata = new Map<
            string,
            { label: string; type: NodeType; owner?: string; slug?: string; subdomain?: string; metadata?: any }
        >();
        const nodesMap = new Map<string, Node>();
        const edges: Edge[] = [];

        // Cache contract lookups to avoid multiple Tenderly calls for the same address
        const contractInfoCache = new Map<string, any>();

        const fetchContractInfo = async (address: string) => {
            if (!address || !address.startsWith('0x')) return null;
            const normalized = address.toLowerCase();
            if (contractInfoCache.has(normalized)) {
                return contractInfoCache.get(normalized);
            }

            try {
                const contractUrl = `https://api.tenderly.co/api/v1/public-contract/${chainId}/${normalized}`;
                const res = await fetch(contractUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Access-Key': tenderlyKey,
                    },
                });

                if (!res.ok) {
                    throw new Error(`Tenderly contract ${res.status} ${res.statusText}`);
                }

                const data = await res.json();
                const label =
                    data?.name ||
                    data?.contract_name ||
                    data?.display_name ||
                    data?.symbol ||
                    `${normalized.slice(0, 6)}...${normalized.slice(-4)}`;

                const info = {
                    label,
                    address: normalized,
                    raw: data,
                };
                contractInfoCache.set(normalized, info);
                return info;
            } catch (err) {
                console.warn(`Contract info fetch failed for ${address}:`, err);
                contractInfoCache.set(normalized, null);
                return null;
            }
        };

        if (traceResult.error) {
            return NextResponse.json(
                { error: `Tenderly API Error: ${traceResult.error.message || JSON.stringify(traceResult.error)}` },
                { status: 500 },
            );
        }

        const resolvePluginType = (id: string): NodeType => {
            const normalized = id.toLowerCase();
            if (normalized.includes('router')) {
                return 'ROUTER';
            }
            return 'PLUGIN';
        };

        // Helper to add node while enriching with plugin metadata when available
        const addNode = (address: string, type: NodeType = 'CONTRACT', explicitLabel?: string) => {
            if (!address) return '0x0000000000000000000000000000000000000000';
            const normalizedAddr = address.toLowerCase();
            const pluginMeta = pluginMetadata.get(normalizedAddr);
            const resolved = resolveAddress(address);

            const nodeType = pluginMeta?.type || type || (resolved.type as NodeType);
            const label =
                explicitLabel ||
                pluginMeta?.label ||
                (resolved.label !== normalizedAddr ? resolved.label : `${normalizedAddr.slice(0, 6)}...${normalizedAddr.slice(-4)}`);

            if (!nodesMap.has(normalizedAddr)) {
                nodesMap.set(normalizedAddr, {
                    id: normalizedAddr,
                    label,
                    type: nodeType,
                    address: normalizedAddr,
                    metadata: pluginMeta?.metadata,
                });
            } else {
                const existing = nodesMap.get(normalizedAddr)!;
                nodesMap.set(normalizedAddr, {
                    ...existing,
                    label: pluginMeta?.label || explicitLabel || existing.label,
                    type: pluginMeta?.type || existing.type || nodeType,
                    metadata: pluginMeta?.metadata || existing.metadata,
                });
            }
            return normalizedAddr;
        };

        const registerPlugin = (plugin: any, ownerLabel?: string) => {
            const pluginAddress = (plugin?.address || plugin?.pluginAddress || '').toLowerCase();
            if (!pluginAddress || !pluginAddress.startsWith('0x')) return;

            const pluginId =
                plugin?.name ||
                plugin?.subdomain ||
                plugin?.slug ||
                plugin?.pluginRepo?.subdomain ||
                plugin?.processKey ||
                pluginAddress;

            const type = resolvePluginType(pluginId);
            const label = (pluginId || '').length > 0 ? pluginId : `Plugin ${pluginAddress.slice(0, 6)}...${pluginAddress.slice(-4)}`;

            pluginMetadata.set(pluginAddress, {
                label,
                type,
                owner: ownerLabel,
                slug: plugin?.slug,
                subdomain: plugin?.subdomain || plugin?.pluginRepo?.subdomain,
                metadata: {
                    kind: 'plugin',
                    name: plugin?.name,
                    slug: plugin?.slug,
                    subdomain: plugin?.subdomain || plugin?.pluginRepo?.subdomain,
                    owner: ownerLabel,
                },
            });
        };

        const registerPolicy = async (policy: any, ownerLabel?: string) => {
            const policyAddress = (policy?.address || '').toLowerCase();
            if (!policyAddress || !policyAddress.startsWith('0x')) return;

            const isRouterLike =
                policy?.interfaceType === 'router' ||
                policy?.strategy?.type === 'router' ||
                policy?.strategy?.type === 'burnRouter';

            const policyId =
                policy?.name ||
                policy?.policyKey ||
                policy?.strategy?.type ||
                `Policy ${policyAddress.slice(0, 6)}...${policyAddress.slice(-4)}`;

            const sourceInfo = await fetchContractInfo(policy?.strategy?.source?.address);
            const vaultInfo = await fetchContractInfo(policy?.strategy?.source?.vaultAddress);

            pluginMetadata.set(policyAddress, {
                label: policyId,
                type: isRouterLike ? 'ROUTER' : 'PLUGIN',
                owner: ownerLabel,
                slug: policy?.policyKey,
                metadata: {
                    kind: 'policy',
                    name: policy?.name,
                    policyKey: policy?.policyKey,
                    interfaceType: policy?.interfaceType,
                    strategy: policy?.strategy,
                    description: policy?.description,
                    links: policy?.links,
                    release: policy?.release,
                    build: policy?.build,
                    daoAddress: policy?.daoAddress,
                    sourceInfo: sourceInfo ?? undefined,
                    vaultInfo: vaultInfo ?? undefined,
                },
            });
        };

        // 3a. Enrich Metadata from Parent DAO (Dynamic)
        // Hardcoded Parent DAO for this demo context
        const PARENT_DAO_ADDRESS = '0xEB4813f79E18bbd62F9222CC98F5049B872F5c04';
        const NETWORK = 'ethereum-sepolia'; // Should match Network.ETHEREUM_SEPOLIA

        try {
            console.log(`Fetching metadata for ${NETWORK}-${PARENT_DAO_ADDRESS} via daoService`);

            // Use daoService to fetch details (handles v2/v3, auth, etc.)
            const daoData = await daoService.getDao({
                urlParams: { id: `${NETWORK}-${PARENT_DAO_ADDRESS}` },
            });

            if (daoData) {
                // 1. Label Parent DAO
                if (daoData.address) {
                    addNode(daoData.address, 'DAO', daoData.name || 'Parent DAO');
                }

                // 2. Register parent plugins (may come embedded)
                if (daoData.plugins && Array.isArray(daoData.plugins)) {
                    daoData.plugins.forEach((plugin: any) => registerPlugin(plugin, daoData.name));
                }

                // 3. Register parent DAO policies
                try {
                    const parentPolicies = await daoService.getDaoPolicies({
                        urlParams: { network: NETWORK as any, daoAddress: daoData.address },
                    });
                    if (parentPolicies?.length) {
                        await Promise.all(parentPolicies.map((p: any) => registerPolicy(p, daoData.name)));
                    }
                } catch (polErr) {
                    console.warn(`Failed to fetch policies for parent DAO ${daoData?.address}:`, polErr);
                }

                // 3. Label SubDAOs and capture their plugins
                if (daoData.subDaos && daoData.subDaos.length) {
                    const { pluginsService } = await import('@/shared/api/pluginsService/pluginsService');

                    await Promise.all(
                        daoData.subDaos.map(async (sd: any) => {
                            const sdAddr = sd.address?.toLowerCase();
                            if (sdAddr) {
                                addNode(sdAddr, 'SUBDAO', sd.name || 'SubDAO');
                            }

                            try {
                                const sdPlugins = await pluginsService.getPluginsByDao({
                                    urlParams: { network: sd.network as any, address: sd.address },
                                });
                                sdPlugins?.forEach((p: any) => registerPlugin(p, sd.name));
                            } catch (sdErr) {
                                console.warn(`Failed to fetch plugins for subDAO ${sd?.address}:`, sdErr);
                            }

                            try {
                                const sdPolicies = await daoService.getDaoPolicies({
                                    urlParams: { network: sd.network as any, daoAddress: sd.address },
                                });
                                if (sdPolicies?.length) {
                                    await Promise.all(sdPolicies.map((p: any) => registerPolicy(p, sd.name)));
                                }
                            } catch (sdPolErr) {
                                console.warn(`Failed to fetch policies for subDAO ${sd?.address}:`, sdPolErr);
                            }
                        }),
                    );
                }
            }

            // 4. Fetch Parent Plugins separately (V3 doesn't include them in DAO response)
            const { pluginsService } = await import('@/shared/api/pluginsService/pluginsService');
            const plugins = await pluginsService.getPluginsByDao({
                urlParams: { network: NETWORK as any, address: PARENT_DAO_ADDRESS },
            });

            plugins?.forEach((p: any) => registerPlugin(p, daoData?.name));
        } catch (metaErr) {
            console.error('Metadata fetch error:', metaErr);
            // Continue without dynamic metadata
        }

        // Parse asset_changes for Token Transfers (Capital Flow)
        if (traceResult.asset_changes && Array.isArray(traceResult.asset_changes)) {
            traceResult.asset_changes.forEach((change: any, idx: number) => {
                if (change.type === 'Transfer' && change.from && change.to) {
                    const from = addNode(change.from, 'CONTRACT');
                    const to = addNode(
                        change.to,
                        change.to.toLowerCase() === '0x000000000000000000000000000000000000dead'
                            ? 'CONTRACT'
                            : 'CONTRACT',
                    );

                    const symbol = change.token_info?.symbol || 'TOKEN';
                    const amount = change.amount || '?';

                    edges.push({
                        id: `e-transfer-${idx}`,
                        source: from,
                        target: to,
                        label: `${amount} ${symbol}`,
                        type: 'TOKEN',
                        data: {
                            tokenAddress: change.token_info?.contract_address,
                            rawAmount: change.raw_amount,
                        },
                    });
                }
            });
        }

        // Parse logs for Executed events (Governance Actions)
        if (traceResult.logs && Array.isArray(traceResult.logs)) {
            traceResult.logs.forEach((log: any, idx: number) => {
                if (log.name === 'Executed') {
                    // Find actor (from) and contract that emitted (to)
                    const actorInput = log.inputs?.find((i: any) => i.soltype?.name === 'actor');
                    const actor = actorInput?.value;
                    const daoAddress = log.raw?.address;

                    if (actor && daoAddress) {
                        const from = addNode(actor, 'CONTRACT');
                        const to = addNode(daoAddress, 'DAO');

                        edges.push({
                            id: `e-exec-${idx}`,
                            source: from,
                            target: to,
                            label: 'Executed',
                            type: 'CALL',
                        });
                    }
                }
            });
        }

        // Format for frontend
        const graphData: GraphData = {
            nodes: Array.from(nodesMap.values()).map((node) => {
                const resolved = resolveAddress(node.address);

                // Priority:
                // 1. Dynamic Metadata (already in 'node' if type is DAO/SUBDAO/ROUTER)
                // 2. Static Resolver (if it found a known CONTRACT label)
                // 3. Default (shortened address)

                // If we already identified it as a specific high-value type dynamically, keep it.
                if (['DAO', 'SUBDAO', 'ROUTER', 'PLUGIN'].includes(node.type)) {
                    return node;
                }

                // If static resolver has a better name than just "CONTRACT" or "WALLET", use it
                if (resolved.type === 'CONTRACT' && resolved.label !== node.id) {
                    return {
                        ...node,
                        label: resolved.label,
                        type: 'CONTRACT',
                    };
                }

                return node;
            }),
            edges,
        };

        return NextResponse.json(graphData);
    } catch (error: any) {
        console.error('Handler error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
