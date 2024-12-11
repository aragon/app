import type { IUseConnectedParticipantGuardBaseParams } from '@/modules/governance/hooks/useConnectedParticpantGuard';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { DefinitionList, Dialog, Heading, Spinner } from '@aragon/gov-ui-kit';
import { useCallback, useEffect } from 'react';

export interface IPermissionCheckGuardResult {
    /**
     * Defines if the user has permission or not.
     */
    hasPermission: boolean;
    /**
     * Settings to be displayed as reason on why the user does not have the specified permission.
     */
    settings: IPermissionCheckGuardSetting[];
    /**
     * Indicates if the slot-function is loading the data needed to check the specific permission.
     */
    isLoading: boolean;
}

export interface IPermissionCheckGuardSetting {
    /**
     * Term of the permission setting.
     */
    term: string;
    /**
     * Definition of the permission setting.
     */
    definition: string;
}

export interface IPermissionCheckDialogParams<TSlotParams extends IUseConnectedParticipantGuardBaseParams> {
    /**
     * Parameters related to the proposal.
     */
    params: TSlotParams;
    /**
     * Id of the slot to be used for checking the user permissions.
     */
    slotId: string;
    /**
     * Callback called when user has permissions
     */
    onSuccess?: () => void;
    /**
     * Callback called when user does not have permissions.
     */
    onError?: () => void;
}

export interface IPermissionCheckDialogProps<TSlotParams extends IUseConnectedParticipantGuardBaseParams>
    extends IDialogComponentProps<IPermissionCheckDialogParams<TSlotParams>> {}

export const PermissionCheckDialog = <TSlotParams extends IUseConnectedParticipantGuardBaseParams>(
    props: IPermissionCheckDialogProps<TSlotParams>,
) => {
    const { params } = props.location;
    const { slotParams, slotId, onSuccess, onError, updatePermissions } = params ?? {};
    const { plugin, daoId } = slotParams ?? {};

    const { close } = useDialogContext();

    const { hasPermission, settings, isLoading } = useSlotSingleFunction<
        IUseConnectedParticipantGuardBaseParams,
        IPermissionCheckGuardResult
    >({
        slotId: slotId!,
        pluginId: plugin!.id,
        params: slotParams,
    });

    // get the plugin settings

    // get the member settings for the plugin

    // check if the qualifies for the proposal creation requirements

    // return the definition list of terms and definitions as array of objects

    const handleDialogClose = useCallback(() => {
        close();
        onError?.();
    }, [close, onError]);

    useEffect(() => {
        if (hasPermission) {
            updatePermissions(hasPermission);
            onSuccess?.();
            close();
        }
    }, [hasPermission, onSuccess, close]);

    if (isLoading) {
        return (
            <Dialog.Content className="flex w-full flex-col gap-y-4 py-4 md:py-6">
                <Heading size="h3">Checking permissions...</Heading>
                <div className="flex h-12 w-full items-center justify-center">
                    <Spinner size="xl" className="self-center" />
                </div>
            </Dialog.Content>
        );
    }

    return (
        <>
            <Dialog.Content className="flex flex-col gap-y-4 py-4 md:py-6">
                <div>
                    <Heading size="h3">You can&apos;t create</Heading>
                    <p className="text-neutral-500">Not a member of this voting body</p>
                </div>
                <DefinitionList.Container>
                    {settings.map((setting, index) => (
                        <DefinitionList.Item key={index} term={setting.term}>
                            {setting.definition}
                        </DefinitionList.Item>
                    ))}
                </DefinitionList.Container>
            </Dialog.Content>
            <Dialog.Footer secondaryAction={{ label: 'Okay', onClick: handleDialogClose }} />
        </>
    );
};
