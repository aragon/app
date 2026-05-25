'use client';

import { Dialog, InputText, invariant } from '@aragon/gov-ui-kit';
import { useForm } from 'react-hook-form';
import { memberRegistrySubdomainSuffix } from '@/modules/ens';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ApplicationDialogId } from '../../constants/applicationDialogId';
import { useEnsSubdomainField } from '../../hooks/useEnsSubdomainField';

interface IFormData {
    /** New ENS subdomain label, e.g. "alice". */
    subdomain: string;
}

export interface IAragonProfileRenameDialogParams {
    /** Current Aragon ENS name, e.g. "alice.aragonx.eth". */
    currentEnsName: string;
}

export interface IAragonProfileRenameDialogProps
    extends IDialogComponentProps<IAragonProfileRenameDialogParams> {}

export const AragonProfileRenameDialog: React.FC<
    IAragonProfileRenameDialogProps
> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'AragonProfileRenameDialog: required params must be set.',
    );
    const { currentEnsName } = location.params;
    const currentSubdomain = currentEnsName.replace(
        memberRegistrySubdomainSuffix,
        '',
    );

    const { t } = useTranslations();
    const { open, close } = useDialogContext();

    const { control, handleSubmit } = useForm<IFormData>({
        mode: 'onTouched',
        defaultValues: { subdomain: '' },
    });

    const { fieldProps, isCheckingAvailability, isNameTaken } =
        useEnsSubdomainField<IFormData, 'subdomain'>({
            control,
            name: 'subdomain',
            label: t(
                'app.application.aragonProfileRenameDialog.fields.subdomain.label',
            ),
            currentSubdomain,
        });

    const handleCancel = () => close(location.id);

    const handleSubmitRename = handleSubmit(({ subdomain }) => {
        open(ApplicationDialogId.ARAGON_PROFILE_RENAME_TRANSACTION, {
            stack: true,
            params: { subdomain },
        });
    });

    const isSubmitDisabled = isNameTaken || isCheckingAvailability;

    return (
        <>
            <Dialog.Header
                description={t(
                    'app.application.aragonProfileRenameDialog.description',
                )}
                onClose={handleCancel}
                title={t('app.application.aragonProfileRenameDialog.title')}
            />
            <Dialog.Content className="flex flex-col gap-3 px-6 pt-4 pb-6">
                <InputText
                    {...fieldProps}
                    helpText={t(
                        'app.application.aragonProfileRenameDialog.fields.subdomain.helpText',
                    )}
                    placeholder={t(
                        'app.application.aragonProfileRenameDialog.fields.subdomain.placeholder',
                    )}
                />
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t(
                        'app.application.aragonProfileRenameDialog.actions.submit',
                    ),
                    onClick: handleSubmitRename,
                    disabled: isSubmitDisabled,
                    isLoading: isCheckingAvailability,
                }}
                secondaryAction={{
                    label: t(
                        'app.application.aragonProfileRenameDialog.actions.cancel',
                    ),
                    onClick: handleCancel,
                }}
            />
        </>
    );
};
