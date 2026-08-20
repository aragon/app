'use client';

import { DataList } from '@aragon/gov-ui-kit';
import { useMpcRequests } from '@/modules/mpc/api/mpcService';
import type {
    IMpcSignRequest,
    MpcMemberRole,
} from '@/modules/mpc/api/mpcService/domain';
import { useTranslations } from '@/shared/components/translationsProvider';
import { MpcRequestItem } from '../mpcRequestItem';

export interface IMpcRequestListProps {
    /**
     * ID of the system.
     */
    systemId: string;
    /**
     * Role of the current user in the system.
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
    /**
     * Callback called on sign click.
     */
    onSignClick?: (request: IMpcSignRequest) => void;
    /**
     * Callback called on review click.
     */
    onReviewClick?: (request: IMpcSignRequest) => void;
    /**
     * Callback called on edit click (editable requests).
     */
    onEditClick?: (request: IMpcSignRequest) => void;
    /**
     * Callback called on the empty state action click.
     */
    onNewRequestClick?: () => void;
}

export const MpcRequestList: React.FC<IMpcRequestListProps> = (props) => {
    const {
        systemId,
        role,
        username,
        hasDeviceShare,
        onSignClick,
        onReviewClick,
        onEditClick,
        onNewRequestClick,
    } = props;
    const { t } = useTranslations();

    const { data, isLoading, isError } = useMpcRequests(
        { urlParams: { systemId } },
        // Poll to reflect approvals / broadcasts made by other members.
        { refetchInterval: 10_000 },
    );

    const state = isLoading ? 'initialLoading' : isError ? 'error' : 'idle';

    return (
        <DataList.Root
            entityLabel={t('app.mpc.mpcRequestList.entity')}
            itemsCount={data?.length}
            state={state}
        >
            <DataList.Container
                emptyState={{
                    heading: t('app.mpc.mpcRequestList.empty.heading'),
                    description: t('app.mpc.mpcRequestList.empty.description'),
                    objectIllustration: { object: 'ACTION' },
                    primaryButton:
                        onNewRequestClick != null
                            ? {
                                  label: t(
                                      'app.mpc.mpcRequestList.empty.action',
                                  ),
                                  onClick: onNewRequestClick,
                              }
                            : undefined,
                }}
                errorState={{
                    heading: t('app.mpc.mpcRequestList.error.heading'),
                    description: t('app.mpc.mpcRequestList.error.description'),
                    objectIllustration: { object: 'ERROR' },
                }}
            >
                {data?.map((request) => (
                    <MpcRequestItem
                        hasDeviceShare={hasDeviceShare}
                        key={request.id}
                        onEditClick={onEditClick}
                        onReviewClick={onReviewClick}
                        onSignClick={onSignClick}
                        request={request}
                        role={role}
                        username={username}
                    />
                ))}
            </DataList.Container>
        </DataList.Root>
    );
};
