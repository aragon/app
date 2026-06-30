import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IDaoPermission } from '@/shared/api/daoService';
import type { IBackendApiMock } from '@/shared/types';
import type { IPermissionRow } from '../types';
import { ALLOW_FLAG, ANY_ADDR } from './permissionSentinels';

/**
 * Real permission-id hashes (keccak256 of the permission strings) so the UI
 * resolves them to human-readable names.
 */
const ROOT_PERMISSION_ID =
    '0x815fe80e4b37c8582a3b773d1d7071f983eacfd56b5965db654f3087c25ada33';
const EXECUTE_PERMISSION_ID =
    '0xbf04b4486c9663d805744005c3da000eda93de6e3308a4a7a812eb565327b78d';
const CREATE_PROPOSAL_PERMISSION_ID =
    '0x8c433a4cd6b51969eca37f974940894297b9fcf4b282a213fea5cd8f85289c90';
const MANAGE_SELECTORS_PERMISSION_ID =
    '0x485a22b473de7ee3091c71c5ce05019fd1466a1650b1228784a9bcd5b7bed510';

const daoAddress = '0x1F2e3D4C5b6A70819283746556473829100AbCdE';
const pluginAddress = '0xA1b2C3d4E5F60718293A4b5C6d7E8f9001234567';
const tokenAddress = '0x0bA45A8b5d5575935B8158a88C631E9F9C95a2e5';
const votingConditionAddress = '0xC0Ffee254729296a45a3885639AC7E10F9d54979';
const selectorConditionAddress = '0xDe0B295669a9FD93d5F28D9Ec85E40f4cb697BAe';
const unknownConditionAddress = '0xaB5801a7D398351b8bE11C439e05C5B3259aeC9B';

const permissions: Array<IDaoPermission & IPermissionRow> = [
    {
        // No condition: granted unconditionally to "Anyone".
        permissionId: ROOT_PERMISSION_ID,
        whoAddress: ANY_ADDR,
        whereAddress: daoAddress,
        conditionAddress: ALLOW_FLAG,
    },
    {
        // Voting-power gated condition.
        permissionId: EXECUTE_PERMISSION_ID,
        whoAddress: pluginAddress,
        whereAddress: daoAddress,
        conditionAddress: votingConditionAddress,
        condition: {
            conditionType: 'voting-power',
            token: tokenAddress,
            minVotingPower: '1000000000000000000',
        },
    },
    {
        // Execute-selector gated condition.
        permissionId: MANAGE_SELECTORS_PERMISSION_ID,
        whoAddress: pluginAddress,
        whereAddress: daoAddress,
        conditionAddress: selectorConditionAddress,
        condition: {
            conditionType: 'execute-selector',
            selectors: ['0xa9059cbb'],
            targets: [tokenAddress],
        },
    },
    {
        // Unknown / unrecognised condition type → resolves to Fallback.
        permissionId: CREATE_PROPOSAL_PERMISSION_ID,
        whoAddress: pluginAddress,
        whereAddress: daoAddress,
        conditionAddress: unknownConditionAddress,
        condition: {
            conditionType: 'mystery-condition',
        },
    },
];

const permissionsResponse: IPaginatedResponse<IDaoPermission & IPermissionRow> =
    {
        metadata: {
            page: 1,
            pageSize: permissions.length,
            totalPages: 1,
            totalRecords: permissions.length,
        },
        data: permissions,
    };

/**
 * Preview-mode mock for `GET /permissions/:network/:daoAddress`. Covers every
 * conditionType scenario (no-condition, voting-power, execute-selector,
 * unknown) so the permissions UI can be exercised without a live backend.
 */
export const permissionsMocks: IBackendApiMock[] = [
    {
        url: /\/permissions\//,
        type: 'replace',
        data: permissionsResponse,
    },
];
