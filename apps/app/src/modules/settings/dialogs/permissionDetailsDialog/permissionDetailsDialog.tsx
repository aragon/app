'use client';

import { Dialog, invariant } from '@aragon/gov-ui-kit';
import type { IDao, IDaoPermission } from '@/shared/api/daoService';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';
import {
    type IPermissionDetailContentProps,
    PermissionDetailContent,
} from '../../components/permissionsGraph/permissionDetailContent';

export interface IPermissionDetailsDialogParams {
    /**
     * Permission row presented by the dialog.
     */
    row: IDaoPermission;
    /**
     * Resolved display entity holding the permission.
     */
    who?: IPermissionDetailContentProps['who'];
    /**
     * Resolved display entity the permission is granted on.
     */
    where?: IPermissionDetailContentProps['where'];
    /**
     * Chain ID used for block-explorer links.
     */
    chainId?: number;
    /**
     * Network of the DAO.
     */
    network?: IDao['network'];
    /**
     * Tab the shared detail card opens on.
     */
    view: 'details' | 'condition';
}

export interface IPermissionDetailsDialogProps
    extends IDialogComponentProps<IPermissionDetailsDialogParams> {}

export const PermissionDetailsDialog: React.FC<
    IPermissionDetailsDialogProps
> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'PermissionDetailsDialog: required parameters must be set.',
    );

    const { row, who, where, chainId, network, view } = location.params;

    const { close } = useDialogContext();
    const permissionName = permissionNameUtils.getPermissionName(
        row.permissionId,
    );

    return (
        <>
            <Dialog.Header onClose={() => close()} title={permissionName} />
            <Dialog.Content className="pb-4">
                <PermissionDetailContent
                    chainId={chainId}
                    className="flex flex-col gap-4"
                    initialTab={
                        view === 'condition' ? 'condition' : 'permission'
                    }
                    network={network}
                    permissionName={permissionName}
                    row={row}
                    where={where}
                    who={who}
                />
            </Dialog.Content>
        </>
    );
};
