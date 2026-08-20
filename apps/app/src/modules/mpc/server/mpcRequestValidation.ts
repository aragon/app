import type { NextRequest } from 'next/server';
import { type Address, getAddress, type Hex } from 'viem';
import type {
    IMpcAddMemberParams,
    IMpcAddWorkspaceMemberParams,
    IMpcApproveRequestParams,
    IMpcCheckPolicyFlowParams,
    IMpcCompleteRequestParams,
    IMpcCreateRequestParams,
    IMpcCreateSystemParams,
    IMpcCreateWorkspaceParams,
    IMpcLoginParams,
    IMpcPolicy,
    IMpcPolicyFlow,
    IMpcPolicyFlowEdge,
    IMpcPolicyFlowNode,
    IMpcPolicySimContext,
    IMpcPolicyTokenLimit,
    IMpcRegisterKeyParams,
    IMpcReshareParams,
    IMpcSaveWorkspacePolicyParams,
    IMpcServerShareParams,
    IMpcServerSharePayload,
    IMpcSimulateParams,
    IMpcSimulatePolicyFlowParams,
    IMpcTotpVerifyParams,
    IMpcTransactionPayload,
    IMpcUpdateRequestParams,
    IMpcUpdateSystemParams,
    IMpcUpdateWorkspacePolicyParams,
    MpcMemberRole,
    MpcPolicyFlowBranch,
    MpcPolicyFlowNodeType,
    MpcProviderId,
    MpcSharePurpose,
    MpcSignRequestPayload,
} from '@/modules/mpc/api/mpcService/domain';
import { MpcApiError } from './mpcApiError';

/**
 * Manual request validation for the POC API (no schema library available). Every validator throws a
 * MpcApiError('validation_error') with a clear message.
 */

export const MPC_MAX_BODY_BYTES = 64 * 1024;
export const MPC_CLIENT_HEADER = 'x-mpc-client';
export const MPC_CLIENT_HEADER_VALUE = 'aragon-app';

const MAX_NAME_LENGTH = 64;
const MAX_DESCRIPTION_LENGTH = 512;
const MAX_MESSAGE_LENGTH = 16 * 1024;
const MAX_TYPED_DATA_LENGTH = 32 * 1024;
const MAX_CALLDATA_LENGTH = 32 * 1024;

const ADDRESS_REGEX = /^0x[0-9a-fA-F]{40}$/;
const HEX_REGEX = /^0x([0-9a-fA-F]{2})*$/;
const WEI_REGEX = /^(0|[1-9][0-9]{0,77})$/;
const TOTP_CODE_REGEX = /^\d{6}$/;

const PROVIDER_IDS: MpcProviderId[] = ['mock-shamir', 'dfns', 'dynamic'];
const MEMBER_ROLES: MpcMemberRole[] = ['owner', 'approver', 'viewer'];
// "export" is intentionally not accepted: the UI exports with the recovery share, releasing B for export would
// hand the full key to a single owner without co-approval (see README).
const SHARE_PURPOSES: MpcSharePurpose[] = ['sign', 'reshare', 'recover'];

const validationError = (message: string): MpcApiError =>
    new MpcApiError('validation_error', message);

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value != null && !Array.isArray(value);

export const isAddressString = (value: unknown): value is Address =>
    typeof value === 'string' && ADDRESS_REGEX.test(value);

export const isHexString = (value: unknown): value is Hex =>
    typeof value === 'string' && HEX_REGEX.test(value);

export const isWeiString = (value: unknown): value is string =>
    typeof value === 'string' && WEI_REGEX.test(value);

const requireString = (
    value: unknown,
    field: string,
    options: { min?: number; max: number },
): string => {
    if (typeof value !== 'string') {
        throw validationError(`"${field}" must be a string.`);
    }

    const trimmed = value.trim();
    const min = options.min ?? 1;

    if (trimmed.length < min) {
        throw validationError(`"${field}" is required.`);
    }

    if (trimmed.length > options.max) {
        throw validationError(
            `"${field}" must be at most ${options.max.toString()} characters.`,
        );
    }

    return trimmed;
};

const requireAddress = (value: unknown, field: string): Address => {
    if (!isAddressString(value)) {
        throw validationError(`"${field}" must be a valid address.`);
    }

    return getAddress(value);
};

const requireHex = (value: unknown, field: string, maxLength: number): Hex => {
    if (!isHexString(value)) {
        throw validationError(`"${field}" must be a 0x-prefixed hex string.`);
    }

    if (value.length > maxLength) {
        throw validationError(`"${field}" is too large.`);
    }

    return value;
};

const requireWei = (value: unknown, field: string): string => {
    if (!isWeiString(value)) {
        throw validationError(
            `"${field}" must be a non-negative integer (wei) as decimal string.`,
        );
    }

    return value;
};

const requireChainId = (value: unknown, field: string): number => {
    if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
        throw validationError(`"${field}" must be a positive integer.`);
    }

    return value;
};

const requireBoolean = (value: unknown, field: string): boolean => {
    if (typeof value !== 'boolean') {
        throw validationError(`"${field}" must be a boolean.`);
    }

    return value;
};

const requireEnum = <TValue extends string>(
    value: unknown,
    field: string,
    allowed: TValue[],
): TValue => {
    if (typeof value !== 'string' || !allowed.includes(value as TValue)) {
        throw validationError(
            `"${field}" must be one of: ${allowed.join(', ')}.`,
        );
    }

    return value as TValue;
};

/**
 * Reads and parses the JSON body enforcing the size limit and the JSON content type.
 */
export const readJsonBody = async (
    request: NextRequest,
): Promise<Record<string, unknown>> => {
    const contentType = request.headers.get('content-type') ?? '';

    if (!contentType.toLowerCase().includes('application/json')) {
        throw validationError('Content-Type must be application/json.');
    }

    const contentLength = Number(request.headers.get('content-length') ?? '0');

    if (contentLength > MPC_MAX_BODY_BYTES) {
        throw new MpcApiError(
            'validation_error',
            'Request body too large.',
            413,
        );
    }

    const text = await request.text();

    if (Buffer.byteLength(text, 'utf8') > MPC_MAX_BODY_BYTES) {
        throw new MpcApiError(
            'validation_error',
            'Request body too large.',
            413,
        );
    }

    if (text.trim().length === 0) {
        return {};
    }

    let parsed: unknown;

    try {
        parsed = JSON.parse(text);
    } catch {
        throw validationError('Request body must be valid JSON.');
    }

    if (!isRecord(parsed)) {
        throw validationError('Request body must be a JSON object.');
    }

    return parsed;
};

const getRequestHost = (request: NextRequest): string | undefined => {
    const forwardedHost = request.headers.get('x-forwarded-host');
    const host = forwardedHost ?? request.headers.get('host');

    return host?.split(',')[0]?.trim().toLowerCase();
};

const getOriginHost = (value: string | null): string | undefined => {
    if (value == null || value.length === 0) {
        return undefined;
    }

    try {
        return new URL(value).host.toLowerCase();
    } catch {
        return undefined;
    }
};

/**
 * CSRF defense in depth for mutations: same-origin check (Origin / Referer host must match the request host, or
 * Sec-Fetch-Site must be same-origin) and mandatory custom header.
 */
export const assertMutationRequest = (request: NextRequest): void => {
    const clientHeader = request.headers.get(MPC_CLIENT_HEADER);

    if (clientHeader !== MPC_CLIENT_HEADER_VALUE) {
        throw new MpcApiError(
            'forbidden',
            `Missing or invalid ${MPC_CLIENT_HEADER} header.`,
        );
    }

    const secFetchSite = request.headers.get('sec-fetch-site');

    if (
        secFetchSite != null &&
        secFetchSite !== 'same-origin' &&
        secFetchSite !== 'none'
    ) {
        throw new MpcApiError(
            'forbidden',
            'Cross-site requests are not allowed.',
        );
    }

    const requestHost = getRequestHost(request);
    const originHost = getOriginHost(request.headers.get('origin'));
    const refererHost = getOriginHost(request.headers.get('referer'));

    if (originHost != null) {
        if (originHost !== requestHost) {
            throw new MpcApiError('forbidden', 'Origin mismatch.');
        }

        return;
    }

    if (refererHost != null) {
        if (refererHost !== requestHost) {
            throw new MpcApiError('forbidden', 'Referer mismatch.');
        }

        return;
    }

    if (secFetchSite === 'same-origin') {
        return;
    }

    throw new MpcApiError(
        'forbidden',
        'Unable to verify the request origin (missing Origin / Referer / Sec-Fetch-Site headers).',
    );
};

// Body validators

export const validateLoginParams = (
    body: Record<string, unknown>,
): IMpcLoginParams => {
    if (
        typeof body.username !== 'string' ||
        typeof body.password !== 'string'
    ) {
        throw validationError('"username" and "password" are required.');
    }

    return { username: body.username, password: body.password };
};

export const validateCreateSystemParams = (
    body: Record<string, unknown>,
): IMpcCreateSystemParams => {
    const name = requireString(body.name, 'name', { max: MAX_NAME_LENGTH });
    const description =
        body.description == null
            ? undefined
            : requireString(body.description, 'description', {
                  min: 0,
                  max: MAX_DESCRIPTION_LENGTH,
              });

    if (!Array.isArray(body.chainIds) || body.chainIds.length === 0) {
        throw validationError('"chainIds" must be a non-empty array.');
    }

    if (body.chainIds.length > 20) {
        throw validationError('"chainIds" must have at most 20 entries.');
    }

    const chainIds = body.chainIds.map((chainId) =>
        requireChainId(chainId, 'chainIds'),
    );
    const providerId = requireEnum(body.providerId, 'providerId', PROVIDER_IDS);
    const workspaceId = requireString(body.workspaceId, 'workspaceId', {
        max: MAX_NAME_LENGTH,
    });

    return {
        name,
        description: description === '' ? undefined : description,
        chainIds: Array.from(new Set(chainIds)),
        providerId,
        workspaceId,
    };
};

export const validateUpdateSystemParams = (
    body: Record<string, unknown>,
): IMpcUpdateSystemParams => {
    const params: IMpcUpdateSystemParams = {};

    if (body.name != null) {
        params.name = requireString(body.name, 'name', {
            max: MAX_NAME_LENGTH,
        });
    }

    if (body.description != null) {
        params.description = requireString(body.description, 'description', {
            min: 0,
            max: MAX_DESCRIPTION_LENGTH,
        });
    }

    if (params.name == null && params.description == null) {
        throw validationError('Nothing to update.');
    }

    return params;
};

export const validateServerSharePayload = (
    value: unknown,
    field = 'serverShare',
): IMpcServerSharePayload => {
    if (!isRecord(value)) {
        throw validationError(`"${field}" must be an object.`);
    }

    const { index, epoch } = value;

    if (
        typeof index !== 'number' ||
        !Number.isInteger(index) ||
        index < 1 ||
        index > 3
    ) {
        throw validationError(`"${field}.index" must be 1, 2 or 3.`);
    }

    if (typeof epoch !== 'number' || !Number.isInteger(epoch) || epoch < 1) {
        throw validationError(`"${field}.epoch" must be a positive integer.`);
    }

    const shareValue = requireHex(value.value, `${field}.value`, 66);

    if (shareValue.length !== 66) {
        throw validationError(`"${field}.value" must be a 32-byte hex string.`);
    }

    return { index, epoch, value: shareValue };
};

export const validateRegisterKeyParams = (
    body: Record<string, unknown>,
): IMpcRegisterKeyParams => {
    const address = requireAddress(body.address, 'address');
    const publicKey = requireHex(body.publicKey, 'publicKey', 132);

    if (publicKey.length !== 132 && publicKey.length !== 68) {
        throw validationError(
            '"publicKey" must be a 65-byte uncompressed (or 33-byte compressed) public key.',
        );
    }

    const serverShare = validateServerSharePayload(body.serverShare);

    if (serverShare.epoch !== 1) {
        throw validationError(
            '"serverShare.epoch" must be 1 on key registration.',
        );
    }

    return { address, publicKey, serverShare };
};

const optionalTotpCode = (value: unknown): string | undefined => {
    if (value == null) {
        return undefined;
    }

    if (typeof value !== 'string' || !TOTP_CODE_REGEX.test(value)) {
        throw validationError('"totpCode" must be a 6-digit code.');
    }

    return value;
};

export const validateServerShareParams = (
    body: Record<string, unknown>,
): IMpcServerShareParams => {
    const purpose = requireEnum(body.purpose, 'purpose', SHARE_PURPOSES);
    const requestId =
        body.requestId == null
            ? undefined
            : requireString(body.requestId, 'requestId', { max: 128 });

    if (purpose === 'sign' && requestId == null) {
        throw validationError(
            '"requestId" is required when purpose is "sign".',
        );
    }

    return { purpose, requestId, totpCode: optionalTotpCode(body.totpCode) };
};

export const validateApproveRequestParams = (
    body: Record<string, unknown>,
): IMpcApproveRequestParams => ({
    totpCode: optionalTotpCode(body.totpCode),
});

export const validateTotpVerifyParams = (
    body: Record<string, unknown>,
): IMpcTotpVerifyParams => {
    const totpCode = optionalTotpCode(body.totpCode);

    if (totpCode == null) {
        throw validationError('"totpCode" is required.');
    }

    return { totpCode };
};

export const validateReshareParams = (
    body: Record<string, unknown>,
): IMpcReshareParams => {
    const serverShare = validateServerSharePayload(body.serverShare);
    const mode = requireEnum(body.mode, 'mode', [
        'reshare',
        'recover',
    ] as const);

    return { serverShare, mode };
};

export const validateAddMemberParams = (
    body: Record<string, unknown>,
): IMpcAddMemberParams => {
    const username = requireString(body.username, 'username', { max: 32 });
    const role = requireEnum(body.role, 'role', MEMBER_ROLES);

    return { username, role };
};

export const validatePolicyParams = (
    body: Record<string, unknown>,
): IMpcPolicy => {
    if (
        !Array.isArray(body.allowedChainIds) ||
        body.allowedChainIds.length === 0
    ) {
        throw validationError('"allowedChainIds" must be a non-empty array.');
    }

    const allowedChainIds = Array.from(
        new Set(
            body.allowedChainIds.map((chainId) =>
                requireChainId(chainId, 'allowedChainIds'),
            ),
        ),
    );

    let recipientAllowlist: Address[] | null = null;

    if (body.recipientAllowlist != null) {
        if (!Array.isArray(body.recipientAllowlist)) {
            throw validationError(
                '"recipientAllowlist" must be an array or null.',
            );
        }

        if (body.recipientAllowlist.length > 200) {
            throw validationError(
                '"recipientAllowlist" must have at most 200 entries.',
            );
        }

        recipientAllowlist = body.recipientAllowlist.map((address) =>
            requireAddress(address, 'recipientAllowlist'),
        );
    }

    const optionalWei = (value: unknown, field: string): string | null =>
        value == null || value === '' ? null : requireWei(value, field);

    const maxValuePerTxWei = optionalWei(
        body.maxValuePerTxWei,
        'maxValuePerTxWei',
    );
    const dailyLimitWei = optionalWei(body.dailyLimitWei, 'dailyLimitWei');
    const requireApprovalAboveWei = optionalWei(
        body.requireApprovalAboveWei,
        'requireApprovalAboveWei',
    );

    const approvalsRequired = body.approvalsRequired ?? 1;

    if (
        typeof approvalsRequired !== 'number' ||
        !Number.isInteger(approvalsRequired) ||
        approvalsRequired < 0 ||
        approvalsRequired > 10
    ) {
        throw validationError(
            '"approvalsRequired" must be an integer between 0 and 10.',
        );
    }

    if (typeof body.allowContractCalls !== 'boolean') {
        throw validationError('"allowContractCalls" must be a boolean.');
    }

    if (typeof body.allowMessageSigning !== 'boolean') {
        throw validationError('"allowMessageSigning" must be a boolean.');
    }

    if (
        body.requireApprovalForMessages != null &&
        typeof body.requireApprovalForMessages !== 'boolean'
    ) {
        throw validationError(
            '"requireApprovalForMessages" must be a boolean when set.',
        );
    }

    let tokenLimits: IMpcPolicyTokenLimit[] | null = null;

    if (body.tokenLimits != null) {
        if (!Array.isArray(body.tokenLimits)) {
            throw validationError('"tokenLimits" must be an array or null.');
        }

        if (body.tokenLimits.length > 20) {
            throw validationError(
                '"tokenLimits" must have at most 20 entries.',
            );
        }

        tokenLimits = body.tokenLimits.map((entry) => {
            if (!isRecord(entry)) {
                throw validationError('"tokenLimits" entries must be objects.');
            }

            const decimals = entry.decimals;

            if (
                typeof decimals !== 'number' ||
                !Number.isInteger(decimals) ||
                decimals < 0 ||
                decimals > 36
            ) {
                throw validationError(
                    '"tokenLimits[].decimals" must be an integer between 0 and 36.',
                );
            }

            return {
                token: requireAddress(entry.token, 'tokenLimits[].token'),
                symbol: requireString(entry.symbol, 'tokenLimits[].symbol', {
                    max: 12,
                }),
                decimals,
                maxAmountUnits:
                    entry.maxAmountUnits == null || entry.maxAmountUnits === ''
                        ? null
                        : requireWei(
                              entry.maxAmountUnits,
                              'tokenLimits[].maxAmountUnits',
                          ),
                requireApprovalAboveUnits:
                    entry.requireApprovalAboveUnits == null ||
                    entry.requireApprovalAboveUnits === ''
                        ? null
                        : requireWei(
                              entry.requireApprovalAboveUnits,
                              'tokenLimits[].requireApprovalAboveUnits',
                          ),
            };
        });
    }

    return {
        allowedChainIds,
        recipientAllowlist,
        maxValuePerTxWei,
        dailyLimitWei,
        requireApprovalAboveWei,
        approvalsRequired,
        allowContractCalls: body.allowContractCalls,
        allowMessageSigning: body.allowMessageSigning,
        requireApprovalForMessages: body.requireApprovalForMessages === true,
        tokenLimits,
    };
};

export const validateTransactionPayload = (
    value: unknown,
    field = 'transaction',
): IMpcTransactionPayload => {
    if (!isRecord(value)) {
        throw validationError(`"${field}" must be an object.`);
    }

    const chainId = requireChainId(value.chainId, `${field}.chainId`);
    const to = requireAddress(value.to, `${field}.to`);
    const valueWei = requireWei(value.valueWei, `${field}.valueWei`);
    const data =
        value.data == null || value.data === ''
            ? undefined
            : requireHex(value.data, `${field}.data`, MAX_CALLDATA_LENGTH);

    return { chainId, to, valueWei, data: data === '0x' ? undefined : data };
};

export const validateCreateRequestParams = (
    body: Record<string, unknown>,
): IMpcCreateRequestParams => {
    if (!isRecord(body.payload)) {
        throw validationError('"payload" must be an object.');
    }

    const { payload } = body;
    const type = requireEnum(payload.type, 'payload.type', [
        'transaction',
        'message',
        'typedData',
    ] as const);

    let validated: MpcSignRequestPayload;

    if (type === 'transaction') {
        validated = {
            type,
            transaction: validateTransactionPayload(
                payload.transaction,
                'payload.transaction',
            ),
        };
    } else if (type === 'message') {
        if (!isRecord(payload.message)) {
            throw validationError('"payload.message" must be an object.');
        }

        const message = requireString(
            payload.message.message,
            'payload.message.message',
            {
                max: MAX_MESSAGE_LENGTH,
            },
        );
        validated = { type, message: { message } };
    } else {
        if (!isRecord(payload.typedData)) {
            throw validationError('"payload.typedData" must be an object.');
        }

        const typedDataJson = requireString(
            payload.typedData.typedDataJson,
            'payload.typedData.typedDataJson',
            { max: MAX_TYPED_DATA_LENGTH },
        );

        let parsed: unknown;

        try {
            parsed = JSON.parse(typedDataJson);
        } catch {
            throw validationError(
                '"payload.typedData.typedDataJson" must be valid JSON.',
            );
        }

        if (
            !isRecord(parsed) ||
            !isRecord(parsed.types) ||
            typeof parsed.primaryType !== 'string' ||
            !isRecord(parsed.message)
        ) {
            throw validationError(
                '"payload.typedData.typedDataJson" must be an EIP-712 typed data object (types, primaryType, domain, message).',
            );
        }

        validated = { type, typedData: { typedDataJson } };
    }

    if (body.dryRun != null && typeof body.dryRun !== 'boolean') {
        throw validationError('"dryRun" must be a boolean when set.');
    }

    if (body.editable != null && typeof body.editable !== 'boolean') {
        throw validationError('"editable" must be a boolean when set.');
    }

    return {
        payload: validated,
        dryRun: body.dryRun === true,
        editable: body.editable === true,
    };
};

/**
 * Body of PUT /requests/[requestId]: the new payload (same shape as the creation payload).
 */
export const validateUpdateRequestParams = (
    body: Record<string, unknown>,
): IMpcUpdateRequestParams => ({
    payload: validateCreateRequestParams(body).payload,
});

// ---- Workspaces ----

export const validateCreateWorkspaceParams = (
    body: Record<string, unknown>,
): IMpcCreateWorkspaceParams => ({
    name: requireString(body.name, 'name', { max: MAX_NAME_LENGTH }),
});

export const validateAddWorkspaceMemberParams = (
    body: Record<string, unknown>,
): IMpcAddWorkspaceMemberParams => ({
    username: requireString(body.username, 'username', {
        max: MAX_NAME_LENGTH,
    }),
});

export const validateCompleteRequestParams = (
    body: Record<string, unknown>,
): IMpcCompleteRequestParams => {
    const signature = requireHex(body.signature, 'signature', 1024);
    const signedTransaction =
        body.signedTransaction == null
            ? undefined
            : requireHex(
                  body.signedTransaction,
                  'signedTransaction',
                  MAX_CALLDATA_LENGTH * 2,
              );

    return { signature, signedTransaction };
};

export const validateSimulateParams = (
    body: Record<string, unknown>,
): IMpcSimulateParams => {
    const transaction = validateTransactionPayload(body, 'body');

    return {
        chainId: transaction.chainId,
        to: transaction.to,
        valueWei: transaction.valueWei,
        data: transaction.data,
    };
};

// ---- Workspace policies (policy editor flows) ----

const MAX_FLOW_NODES = 200;
const MAX_FLOW_ID_LENGTH = 64;
const FLOW_NODE_TYPES: MpcPolicyFlowNodeType[] = [
    'trigger',
    'condition',
    'action',
];
const FLOW_BRANCHES: MpcPolicyFlowBranch[] = ['true', 'false'];

const requireFlowId = (value: unknown, field: string): string => {
    if (
        typeof value !== 'string' ||
        value.length === 0 ||
        value.length > MAX_FLOW_ID_LENGTH
    ) {
        throw validationError(`"${field}" must be a non-empty string.`);
    }

    return value;
};

const validateFlowNode = (
    value: unknown,
    field: string,
): IMpcPolicyFlowNode => {
    if (!isRecord(value)) {
        throw validationError(`"${field}" must be an object.`);
    }

    const node: IMpcPolicyFlowNode = {
        id: requireFlowId(value.id, `${field}.id`),
        type: requireEnum(value.type, `${field}.type`, FLOW_NODE_TYPES),
    };

    if (value.template != null) {
        node.template = requireFlowId(value.template, `${field}.template`);
    }

    if (value.params != null) {
        if (!isRecord(value.params)) {
            throw validationError(`"${field}.params" must be an object.`);
        }

        node.params = value.params;
    }

    // Policy blocks reference another policy of the workspace (inlined before the engine sees the flow).
    if (node.template === 'policy_ref') {
        if (node.type !== 'action') {
            throw validationError(
                `"${field}" policy blocks must be action (leaf) nodes.`,
            );
        }

        if (
            typeof node.params?.policyId !== 'string' ||
            node.params.policyId.length === 0
        ) {
            throw validationError(
                `"${field}.params.policyId" is required for policy blocks.`,
            );
        }
    }

    return node;
};

const validateFlowEdge = (
    value: unknown,
    field: string,
): IMpcPolicyFlowEdge => {
    if (!isRecord(value)) {
        throw validationError(`"${field}" must be an object.`);
    }

    const edge: IMpcPolicyFlowEdge = {
        from: requireFlowId(value.from, `${field}.from`),
        to: requireFlowId(value.to, `${field}.to`),
    };

    if (value.branch != null) {
        edge.branch = requireEnum(
            value.branch,
            `${field}.branch`,
            FLOW_BRANCHES,
        );
    }

    return edge;
};

/**
 * Structural validation of a policy flow (the semantic validation — known templates, enabled blocks, tree
 * shape — is done by the policy engine on check / evaluate).
 */
export const validatePolicyFlow = (
    value: unknown,
    field = 'flow',
): IMpcPolicyFlow => {
    if (!isRecord(value)) {
        throw validationError(`"${field}" must be an object.`);
    }

    if (
        typeof value.flowVersion !== 'number' ||
        !Number.isInteger(value.flowVersion) ||
        value.flowVersion <= 0
    ) {
        throw validationError(
            `"${field}.flowVersion" must be a positive integer.`,
        );
    }

    if (!Array.isArray(value.nodes) || value.nodes.length === 0) {
        throw validationError(`"${field}.nodes" must be a non-empty array.`);
    }

    if (value.nodes.length > MAX_FLOW_NODES) {
        throw validationError(
            `"${field}.nodes" must have at most ${MAX_FLOW_NODES.toString()} entries.`,
        );
    }

    if (!Array.isArray(value.edges)) {
        throw validationError(`"${field}.edges" must be an array.`);
    }

    const nodes = value.nodes.map((node, index) =>
        validateFlowNode(node, `${field}.nodes[${index.toString()}]`),
    );
    const edges = value.edges.map((edge, index) =>
        validateFlowEdge(edge, `${field}.edges[${index.toString()}]`),
    );

    if (nodes.filter((node) => node.type === 'trigger').length !== 1) {
        throw validationError(`"${field}" must have exactly one trigger node.`);
    }

    const ids = new Set(nodes.map((node) => node.id));

    if (ids.size !== nodes.length) {
        throw validationError(`"${field}.nodes" ids must be unique.`);
    }

    for (const edge of edges) {
        if (!ids.has(edge.from) || !ids.has(edge.to)) {
            throw validationError(
                `"${field}.edges" reference unknown nodes (${edge.from} -> ${edge.to}).`,
            );
        }
    }

    const flow: IMpcPolicyFlow = {
        flowVersion: value.flowVersion,
        nodes,
        edges,
    };

    if (typeof value.name === 'string') {
        flow.name = value.name.slice(0, MAX_NAME_LENGTH);
    } else if (
        isRecord(value.name) &&
        typeof value.name.en === 'string' &&
        typeof value.name.es === 'string'
    ) {
        flow.name = {
            en: value.name.en.slice(0, MAX_NAME_LENGTH),
            es: value.name.es.slice(0, MAX_NAME_LENGTH),
        };
    }

    return flow;
};

export const validateSaveWorkspacePolicyParams = (
    body: Record<string, unknown>,
): IMpcSaveWorkspacePolicyParams => {
    const name = requireString(body.name, 'name', { max: MAX_NAME_LENGTH });
    const flow = validatePolicyFlow(body.flow);
    const params: IMpcSaveWorkspacePolicyParams = { name, flow };

    if (body.enabled != null) {
        params.enabled = requireBoolean(body.enabled, 'enabled');
    }

    return params;
};

export const validateUpdateWorkspacePolicyParams = (
    body: Record<string, unknown>,
): IMpcUpdateWorkspacePolicyParams => {
    const params: IMpcUpdateWorkspacePolicyParams = {};

    if (body.name != null) {
        params.name = requireString(body.name, 'name', {
            max: MAX_NAME_LENGTH,
        });
    }

    if (body.flow != null) {
        params.flow = validatePolicyFlow(body.flow);
    }

    if (body.enabled != null) {
        params.enabled = requireBoolean(body.enabled, 'enabled');
    }

    if (params.name == null && params.flow == null && params.enabled == null) {
        throw validationError('Nothing to update.');
    }

    return params;
};

export const validateCheckPolicyFlowParams = (
    body: Record<string, unknown>,
): IMpcCheckPolicyFlowParams => ({ flow: validatePolicyFlow(body.flow) });

export const validateSimulatePolicyFlowParams = (
    body: Record<string, unknown>,
): IMpcSimulatePolicyFlowParams => {
    const flow = validatePolicyFlow(body.flow);

    if (!isRecord(body.context)) {
        throw validationError('"context" must be an object.');
    }

    // The engine validates the context strictly (amounts as decimal strings, closed enums, ...).
    return { flow, context: body.context as unknown as IMpcPolicySimContext };
};
