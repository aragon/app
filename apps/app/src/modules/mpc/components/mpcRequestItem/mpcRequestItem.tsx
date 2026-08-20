'use client';

import {
    addressUtils,
    Button,
    DataList,
    DateFormat,
    formatterUtils,
    IconType,
    Tag,
} from '@aragon/gov-ui-kit';
import { formatEther } from 'viem';
import type {
    IMpcSignRequest,
    MpcMemberRole,
} from '@/modules/mpc/api/mpcService/domain';
import { mpcTransactionExplorerUrl } from '@/modules/mpc/constants/mpcConstants';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    getMpcRequestPermissions,
    mpcRequestStatusVariant,
} from './mpcRequestUtils';

export interface IMpcRequestItemProps {
    /**
     * Sign request to display.
     */
    request: IMpcSignRequest;
    /**
     * Role of the current user in the system.
     */
    role?: MpcMemberRole;
    /**
     * Username of the current user.
     */
    username?: string;
    /**
     * Whether the device share is available in this browser (enables the sign action).
     */
    hasDeviceShare?: boolean;
    /**
     * Callback called on sign click.
     */
    onSignClick?: (request: IMpcSignRequest) => void;
    /**
     * Callback called on review (approve / reject) click.
     */
    onReviewClick?: (request: IMpcSignRequest) => void;
    /**
     * Callback called on edit click (editable requests).
     */
    onEditClick?: (request: IMpcSignRequest) => void;
}

export const MpcRequestItem: React.FC<IMpcRequestItemProps> = (props) => {
    const {
        request,
        role,
        username,
        hasDeviceShare,
        onSignClick,
        onReviewClick,
        onEditClick,
    } = props;
    const { t } = useTranslations();

    const { canSign, canApprove, canReject, canEdit } =
        getMpcRequestPermissions({
            request,
            role,
            username,
            hasDeviceShare,
        });

    const { summary, policyDecision } = request;
    const value =
        summary.valueWei != null
            ? formatEther(BigInt(summary.valueWei))
            : undefined;
    const createdAt = formatterUtils.formatDate(request.createdAt, {
        format: DateFormat.RELATIVE,
    });

    return (
        <DataList.Item className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <Tag
                        label={t(`app.mpc.mpcRequestItem.type.${request.type}`)}
                        variant="neutral"
                    />
                    <Tag
                        label={t(
                            `app.mpc.mpcRequestItem.status.${request.status}`,
                        )}
                        variant={mpcRequestStatusVariant[request.status]}
                    />
                    {request.approvalsRequired > 0 && (
                        <span className="text-neutral-500 text-sm">
                            {t('app.mpc.mpcRequestItem.approvals', {
                                count: request.approvals.length,
                                required: request.approvalsRequired,
                            })}
                        </span>
                    )}
                </div>
                <span className="text-neutral-500 text-sm">
                    {t('app.mpc.mpcRequestItem.createdBy', {
                        user: request.createdBy,
                        date: createdAt ?? request.createdAt,
                    })}
                </span>
            </div>
            <p className="break-words font-semibold text-neutral-800">
                {summary.label}
            </p>
            {request.type === 'transaction' && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-neutral-500 text-sm">
                    {summary.to != null && (
                        <span className="font-mono">
                            {t('app.mpc.mpcRequestItem.to', {
                                to: addressUtils.truncateAddress(summary.to),
                            })}
                        </span>
                    )}
                    {value != null && (
                        <span>
                            {t('app.mpc.mpcRequestItem.value', { value })}
                        </span>
                    )}
                    {summary.isContractCall && (
                        <span className="font-mono">
                            {t('app.mpc.mpcRequestItem.selector', {
                                selector: summary.selector ?? '',
                            })}
                        </span>
                    )}
                </div>
            )}
            {policyDecision.reasons.length > 0 && (
                <ul className="list-disc pl-5 text-neutral-500 text-sm">
                    {policyDecision.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                    ))}
                </ul>
            )}
            {request.txHash != null && (
                <a
                    className="break-all font-mono text-primary-400 text-sm underline"
                    href={mpcTransactionExplorerUrl(request.txHash)}
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    {t('app.mpc.mpcRequestItem.txHash', {
                        hash: request.txHash,
                    })}
                </a>
            )}
            {request.txHash == null && request.signature != null && (
                <p className="break-all font-mono text-neutral-500 text-sm">
                    {t('app.mpc.mpcRequestItem.signature', {
                        signature: request.signature,
                    })}
                </p>
            )}
            {request.error != null && (
                <p className="break-words text-critical-600 text-sm">
                    {t('app.mpc.mpcRequestItem.error', {
                        error: request.error,
                    })}
                </p>
            )}
            {(canSign || canApprove || canReject || canEdit) && (
                <div className="flex flex-wrap gap-2">
                    {canSign && (
                        <Button
                            iconLeft={IconType.CHECKMARK}
                            onClick={() => onSignClick?.(request)}
                            size="sm"
                            variant="primary"
                        >
                            {t('app.mpc.mpcRequestItem.actions.sign')}
                        </Button>
                    )}
                    {(canApprove || canReject) && (
                        <Button
                            onClick={() => onReviewClick?.(request)}
                            size="sm"
                            variant="secondary"
                        >
                            {t('app.mpc.mpcRequestItem.actions.review')}
                        </Button>
                    )}
                    {canEdit && (
                        <Button
                            iconLeft={IconType.PEN}
                            onClick={() => onEditClick?.(request)}
                            size="sm"
                            variant="tertiary"
                        >
                            {t('app.mpc.mpcRequestItem.actions.edit')}
                        </Button>
                    )}
                </div>
            )}
        </DataList.Item>
    );
};
