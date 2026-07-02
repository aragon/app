import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IDaoPermission } from '@/shared/api/daoService';
import type { IBackendApiMock } from '@/shared/types';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';
import type { IPermissionRow } from '../types';
import { ALLOW_FLAG, ANY_ADDR } from './permissionSentinels';
import { PermissionsPreviewRef } from './permissionsPreviewRefs';

// Permission ids are derived from their names so the dictionary stays in a single
// place ({@link permissionNameUtils}) instead of duplicating raw keccak256 hashes.
const ROOT_PERMISSION_ID =
    permissionNameUtils.getPermissionId('ROOT_PERMISSION');
const EXECUTE_PERMISSION_ID =
    permissionNameUtils.getPermissionId('EXECUTE_PERMISSION');
const CREATE_PROPOSAL_PERMISSION_ID = permissionNameUtils.getPermissionId(
    'CREATE_PROPOSAL_PERMISSION',
);

const tokenAddress = '0x0bA45A8b5d5575935B8158a88C631E9F9C95a2e5';
const gaugeVoterAddress = '0x1234567890AbcdEF1234567890aBcdef12345678';
const votingConditionAddress = '0xC0Ffee254729296a45a3885639AC7E10F9d54979';
const selectorConditionAddress = '0xDe0B295669a9FD93d5F28D9Ec85E40f4cb697BAe';
const membershipConditionAddress = '0xaB5801a7D398351b8bE11C439e05C5B3259aeC9B';

// `who` / `where` reference the viewed DAO ({@link PermissionsPreviewRef.self}),
// its first linked DAO and its installed plugins so the sample rows resolve to
// real names, tags and avatars for whichever DAO is previewed (see
// {@link PermissionsPreviewRef}). The scenarios mirror the permissions-page
// Figma (self→self root, self→linked root, plugin execute, anyone-creates).
const permissions: Array<IDaoPermission & IPermissionRow> = [
    {
        // The DAO holds root permission over itself, unconditionally.
        permissionId: ROOT_PERMISSION_ID,
        whoAddress: PermissionsPreviewRef.self,
        whereAddress: PermissionsPreviewRef.self,
        conditionAddress: ALLOW_FLAG,
    },
    {
        // The DAO holds root permission over its linked DAO, unconditionally.
        permissionId: ROOT_PERMISSION_ID,
        whoAddress: PermissionsPreviewRef.self,
        whereAddress: PermissionsPreviewRef.linked,
        conditionAddress: ALLOW_FLAG,
    },
    {
        // The first plugin may execute on the DAO, gated by an execute-selector
        // condition over a handful of functions.
        permissionId: EXECUTE_PERMISSION_ID,
        whoAddress: PermissionsPreviewRef.plugin0,
        whereAddress: PermissionsPreviewRef.self,
        conditionAddress: selectorConditionAddress,
        condition: {
            conditionType: 'execute-selector',
            selectors: ['0x3f4ba83f', '0x40e58ee5', '0x8456cb59'],
            targets: [gaugeVoterAddress, gaugeVoterAddress, gaugeVoterAddress],
        },
    },
    {
        // The second plugin may execute on the DAO, unconditionally.
        permissionId: EXECUTE_PERMISSION_ID,
        whoAddress: PermissionsPreviewRef.plugin1,
        whereAddress: PermissionsPreviewRef.self,
        conditionAddress: ALLOW_FLAG,
    },
    {
        // Anyone may create a proposal on the first plugin, gated by voting power.
        permissionId: CREATE_PROPOSAL_PERMISSION_ID,
        whoAddress: ANY_ADDR,
        whereAddress: PermissionsPreviewRef.plugin0,
        conditionAddress: votingConditionAddress,
        condition: {
            conditionType: 'voting-power',
            token: tokenAddress,
            // Raw base-unit value; renders formatted once token decimals are wired.
            minVotingPower: '1000000000000000000',
        },
    },
    {
        // Anyone may create a proposal on the second plugin, gated by multisig
        // membership.
        permissionId: CREATE_PROPOSAL_PERMISSION_ID,
        whoAddress: ANY_ADDR,
        whereAddress: PermissionsPreviewRef.plugin1,
        conditionAddress: membershipConditionAddress,
        condition: {
            conditionType: 'membership',
            onlyListed: true,
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
 * Preview-mode mock for `GET /permissions/:network/:daoAddress`. Covers the
 * condition scenarios shown in the permissions-page Figma (no-condition,
 * execute-selector, voting-power, membership) so the permissions UI can be
 * exercised without a live backend.
 */
export const permissionsMocks: IBackendApiMock[] = [
    {
        // Scoped to the exact `/permissions/:network/:daoAddress` endpoint so
        // the interceptor can't replace unrelated requests that merely contain
        // the word "permissions" in their path.
        url: /\/permissions\/[\w-]+\/0x[a-fA-F0-9]{40}(?:$|[/?])/,
        type: 'replace',
        data: permissionsResponse,
    },
];
