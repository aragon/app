'use client';

import { Dialog, InputText } from '@aragon/gov-ui-kit';
import { useForm } from 'react-hook-form';
import { useReadContracts } from 'wagmi';
import {
    ensChainId,
    memberRegistryAbi,
    memberRegistryAddress,
    memberRegistrySubdomainSuffix,
} from '@/modules/ens';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { AragonProfilePreviewCard } from '../../components/aragonProfilePreviewCard';
import { ApplicationDialogId } from '../../constants/applicationDialogId';
import { useEnsSubdomainField } from '../../hooks/useEnsSubdomainField';
import { useWalletAccount } from '../../hooks/useWalletAccount';

interface IFormData {
    /** ENS subdomain label to claim, e.g. "alice". */
    subdomain: string;
}

export interface IAragonProfileClaimSubdomainDialogParams {}

export interface IAragonProfileClaimSubdomainDialogProps
    extends IDialogComponentProps<IAragonProfileClaimSubdomainDialogParams> {}

export const AragonProfileClaimSubdomainDialog: React.FC<
    IAragonProfileClaimSubdomainDialogProps
> = (props) => {
    const { location } = props;
    const { id } = location;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();
    const { address } = useWalletAccount();

    const { data: registryData, isLoading: isCheckingRegistration } =
        useReadContracts({
            contracts: [
                {
                    address: memberRegistryAddress,
                    abi: memberRegistryAbi,
                    functionName: 'isRegistered',
                    args: [address!],
                    chainId: ensChainId,
                },
                {
                    address: memberRegistryAddress,
                    abi: memberRegistryAbi,
                    functionName: 'memberSubdomain',
                    args: [address!],
                    chainId: ensChainId,
                },
            ],
            query: { enabled: address != null },
        });

    const isRegistered = registryData?.[0]?.result;
    const existingSubdomain = registryData?.[1]?.result;

    const { control, handleSubmit } = useForm<IFormData>({
        mode: 'onTouched',
        defaultValues: { subdomain: '' },
    });

    const { fieldProps, isCheckingAvailability, isNameTaken } =
        useEnsSubdomainField<IFormData, 'subdomain'>({
            control,
            name: 'subdomain',
            label: t(
                'app.application.aragonProfileClaimSubdomainDialog.fields.subdomain.label',
            ),
            availabilityCheckEnabled: !isCheckingRegistration && !isRegistered,
        });

    const handleCancel = () => close(id);

    const handleClaim = handleSubmit(({ subdomain }) => {
        open(
            ApplicationDialogId.ARAGON_PROFILE_SUBDOMAIN_REGISTER_TRANSACTION,
            {
                stack: true,
                params: { subdomain },
            },
        );
    });

    const handleSetPrimaryEns = () => {
        open(ApplicationDialogId.ARAGON_PROFILE_SET_PRIMARY_ENS_TRANSACTION, {
            stack: true,
            params: { subdomain: existingSubdomain! },
        });
    };

    if (address != null && isRegistered) {
        return (
            <>
                <Dialog.Header
                    description={t(
                        'app.application.aragonProfileClaimSubdomainDialog.alreadyRegistered.description',
                    )}
                    onClose={handleCancel}
                    title={t(
                        'app.application.aragonProfileClaimSubdomainDialog.alreadyRegistered.title',
                    )}
                />
                <Dialog.Content className="flex flex-col gap-3 px-6 pt-4 pb-6">
                    <AragonProfilePreviewCard
                        address={address}
                        label={`${existingSubdomain}${memberRegistrySubdomainSuffix}`}
                    />
                </Dialog.Content>
                <Dialog.Footer
                    primaryAction={{
                        label: t(
                            'app.application.aragonProfileClaimSubdomainDialog.alreadyRegistered.action',
                        ),
                        onClick: handleSetPrimaryEns,
                    }}
                    secondaryAction={{
                        label: t(
                            'app.application.aragonProfileClaimSubdomainDialog.actions.cancel',
                        ),
                        onClick: handleCancel,
                    }}
                />
            </>
        );
    }

    const isSubmitDisabled =
        isNameTaken || isCheckingAvailability || isCheckingRegistration;

    return (
        <>
            <Dialog.Header
                onClose={handleCancel}
                title={t(
                    'app.application.aragonProfileClaimSubdomainDialog.title',
                )}
            />
            <Dialog.Content className="flex flex-col gap-3 px-6 pt-4 pb-6">
                <InputText
                    {...fieldProps}
                    helpText={t(
                        'app.application.aragonProfileClaimSubdomainDialog.fields.subdomain.helpText',
                    )}
                    placeholder={t(
                        'app.application.aragonProfileClaimSubdomainDialog.fields.subdomain.placeholder',
                    )}
                />
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t(
                        'app.application.aragonProfileClaimSubdomainDialog.actions.claim',
                    ),
                    onClick: handleClaim,
                    disabled: isSubmitDisabled,
                    isLoading: isCheckingAvailability || isCheckingRegistration,
                }}
                secondaryAction={{
                    label: t(
                        'app.application.aragonProfileClaimSubdomainDialog.actions.cancel',
                    ),
                    onClick: handleCancel,
                }}
            />
        </>
    );
};
