import type { TagVariant } from '@aragon/gov-ui-kit';
import type {
    IMpcSignRequest,
    MpcMemberRole,
    MpcSignRequestStatus,
} from '@/modules/mpc/api/mpcService/domain';

export const mpcRequestStatusVariant: Record<MpcSignRequestStatus, TagVariant> =
    {
        pending_approval: 'warning',
        approved: 'info',
        released: 'info',
        signed: 'success',
        broadcast: 'success',
        rejected: 'critical',
        failed: 'critical',
    };

export interface IMpcRequestPermissionsParams {
    request: IMpcSignRequest;
    /**
     * Role of the current user in the system (undefined when not a member).
     */
    role?: MpcMemberRole;
    /**
     * Username of the current user.
     */
    username?: string;
    /**
     * Whether the device share is available in this browser.
     */
    hasDeviceShare?: boolean;
}

export interface IMpcRequestPermissions {
    /**
     * The current user can start the signing flow.
     */
    canSign: boolean;
    /**
     * The current user can approve the request.
     */
    canApprove: boolean;
    /**
     * The current user can reject the request.
     */
    canReject: boolean;
    /**
     * The current user can modify the request (editable request, pending / approved, requester or owner).
     */
    canEdit: boolean;
}

const isPrivileged = (role?: MpcMemberRole) =>
    role === 'owner' || role === 'approver';

/**
 * Computes what the current user is allowed to do with a request (mirrors the server rules).
 */
export const getMpcRequestPermissions = (
    params: IMpcRequestPermissionsParams,
): IMpcRequestPermissions => {
    const { request, role, username, hasDeviceShare } = params;
    const isRequester = username != null && request.createdBy === username;
    const isSignable =
        request.status === 'approved' || request.status === 'released';

    const canSign =
        isSignable &&
        (role === 'owner' || isRequester) &&
        hasDeviceShare === true;
    const canApprove =
        request.status === 'pending_approval' &&
        isPrivileged(role) &&
        !isRequester &&
        !request.approvals.some((approval) => approval.username === username);
    // Released requests can be rejected too (abandoned signing flow: frees the daily limit reservation).
    const canReject =
        (request.status === 'pending_approval' ||
            request.status === 'approved' ||
            request.status === 'released') &&
        isPrivileged(role);

    const canEdit =
        request.editable === true &&
        (request.status === 'pending_approval' ||
            request.status === 'approved') &&
        (role === 'owner' || (isRequester && isPrivileged(role)));

    return { canSign, canApprove, canReject, canEdit };
};
