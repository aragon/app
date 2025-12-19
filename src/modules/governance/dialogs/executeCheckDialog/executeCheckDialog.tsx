import { Dialog, invariant } from '@aragon/gov-ui-kit';
import { useCallback, useEffect } from 'react';
import { type Hex, keccak256, toBytes } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { GovernanceDialogId } from '../../constants/governanceDialogId';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { daoAbi } from './daoAbi';

export interface IExecuteCheckDialogParams {
    /**
     *  DAO to check permission on.
     */
    dao: IDao;
    /**
     * Plugin where execute() should be called.
     */
    plugin: IDaoPlugin;
    /**
     * Callback called when the user has the required permissions.
     */
    onSuccess?: () => void;
    /**
     * Callback called when the user does not have the required permissions.
     */
    onError?: () => void;
}

export interface IExecuteCheckDialogProps
    extends IDialogComponentProps<IExecuteCheckDialogParams> {}

const executeProposalPermissionId = keccak256(
    toBytes('EXECUTE_PROPOSAL_PERMISSION'),
);

export const ExecuteCheckDialog: React.FC<IExecuteCheckDialogProps> = (
    props,
) => {
    const { params } = props.location;

    invariant(
        params != null,
        'ExecuteCheckDialog: params not set for execute check dialog',
    );
    const { dao, plugin, onSuccess, onError } = params;
    const { address: pluginAddress, interfaceType } = plugin;

    // dao.hasPermission() check makes sense only if plugin.execute() is restricted (has auth(EXECUTE_PROPOSAL_PERMISSION_ID) modifier).
    // If not, hasPermission() always returns false.
    //
    // So, we put the following logic in place:
    // - for plugins with restricted execute, we run hasPermission()
    // - for plugins with open execute, we return true
    //
    // Checking if a plugin has restricted execute is done by manually comparing supported plugin versions in a slot
    // GOVERNANCE_EXECUTE_CHECK_VERSION_SUPPORTED. Only old plugins have unrestricted execute, so default is assumed to
    // be `true` if slot is not implemented.
    const hasExecuteProposalPermissionGuard =
        pluginRegistryUtils.getSlotFunction<{ plugin: IDaoPlugin }, boolean>({
            slotId: GovernanceSlotId.GOVERNANCE_EXECUTE_CHECK_VERSION_SUPPORTED,
            pluginId: interfaceType,
        })?.({ plugin }) ?? true;

    const { t } = useTranslations();
    const { close } = useDialogContext();
    const { address } = useAccount();

    const { id: chainId } = networkDefinitions[dao.network];

    const { isLoading, error, data } = useReadContract({
        abi: [daoAbi],
        address: dao.address as Hex,
        functionName: 'hasPermission',
        args: [
            pluginAddress as Hex,
            address as Hex,
            executeProposalPermissionId,
            '0x',
        ],
        chainId,
        query: {
            enabled: address != null && hasExecuteProposalPermissionGuard,
        },
    });

    const hasPermission = data === true;

    const handleDialogClose = useCallback(() => {
        onError?.();
        close(GovernanceDialogId.EXECUTE_CHECK);
    }, [close, onError]);

    useEffect(() => {
        if (hasPermission || !hasExecuteProposalPermissionGuard) {
            onSuccess?.();
            close(GovernanceDialogId.EXECUTE_CHECK);
        }
    }, [hasPermission, onSuccess, close, hasExecuteProposalPermissionGuard]);

    useEffect(() => {
        if (error) {
            monitoringUtils.logError(error, {
                context: {
                    errorType: 'read_contract_error',
                    daoAddress: dao.address,
                    pluginAddress,
                    userAddress: address,
                },
            });
        }
    }, [address, dao.address, error, pluginAddress]);

    const title = isLoading
        ? t('app.governance.executeCheckDialog.loading')
        : t('app.governance.executeCheckDialog.title');
    const description = isLoading
        ? undefined
        : t('app.governance.executeCheckDialog.description');

    const footerAction = isLoading
        ? undefined
        : {
              label: t('app.governance.executeCheckDialog.action'),
              onClick: handleDialogClose,
          };

    return (
        <>
            <Dialog.Header title={title} />
            <Dialog.Content className="pb-3" description={description} />
            <Dialog.Footer primaryAction={footerAction} />
        </>
    );
};
