'use client';

import {
    AlertCard,
    DefinitionList,
    Dialog,
    InputContainer,
    InputText,
    invariant,
    Spinner,
} from '@aragon/gov-ui-kit';
import { useForm } from 'react-hook-form';
import {
    memberRegistrySubdomainSuffix,
    useEnsResolverRecords,
} from '@/modules/ens';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useMemberProfileTextRecords } from '../../api/memberProfileService';
import { ApplicationDialogId } from '../../constants/applicationDialogId';
import { useEnsSubdomainField } from '../../hooks/useEnsSubdomainField';
import { useWalletAccount } from '../../hooks/useWalletAccount';

interface IFormData {
    /** New ENS subdomain label, e.g. "alice". */
    subdomain: string;
}

export interface IAragonProfileRenameDialogParams {
    /** Current Aragon ENS name, e.g. "alice.aragon.eth". */
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
    const { address } = useWalletAccount();

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

    // Text records can only be enumerated from the indexer (you can't list
    // arbitrary ENS text-record keys on-chain).
    const {
        data: allTextRecords,
        isLoading: isAllTextRecordsLoading,
        isError: isAllTextRecordsError,
    } = useMemberProfileTextRecords({
        urlParams: { subdomain: currentEnsName },
    });

    // `addr`/`contenthash` are single live values read straight from the
    // resolver so the rename carries the current records over unchanged. A
    // `null` result means the name has no resolver, i.e. the profile was not
    // found — which gates submit (distinct from "found with zero records").
    const {
        data: resolverRecords,
        isLoading: isResolverRecordsLoading,
        isError: isResolverRecordsError,
    } = useEnsResolverRecords(currentEnsName);

    const isRecordsLoading =
        isAllTextRecordsLoading || isResolverRecordsLoading;
    const isRecordsError = isAllTextRecordsError || isResolverRecordsError;
    const isProfileNotFound =
        !isRecordsLoading && !isRecordsError && resolverRecords == null;

    const handleCancel = () => close(location.id);

    const handleSubmitRename = handleSubmit(({ subdomain }) => {
        invariant(
            address != null,
            'AragonProfileRenameDialog: wallet address must be set.',
        );
        invariant(
            resolverRecords != null,
            'AragonProfileRenameDialog: current profile records must be loaded.',
        );

        open(ApplicationDialogId.ARAGON_PROFILE_RENAME_TRANSACTION, {
            stack: true,
            params: {
                subdomain,
                records: {
                    textRecords: allTextRecords ?? [],
                    addr: resolverRecords.addr,
                    contenthash: resolverRecords.contenthash,
                },
            },
        });
    });

    const isSubmitDisabled =
        isNameTaken ||
        isCheckingAvailability ||
        isRecordsLoading ||
        isRecordsError ||
        resolverRecords == null;

    return (
        <>
            <Dialog.Header
                description={t(
                    'app.application.aragonProfileRenameDialog.description',
                )}
                onClose={handleCancel}
                title={t('app.application.aragonProfileRenameDialog.title')}
            />
            <Dialog.Content className="flex flex-col gap-6 px-6 pt-4 pb-6">
                <InputText
                    {...fieldProps}
                    helpText={t(
                        'app.application.aragonProfileRenameDialog.fields.subdomain.helpText',
                    )}
                    placeholder={t(
                        'app.application.aragonProfileRenameDialog.fields.subdomain.placeholder',
                    )}
                />

                {isRecordsLoading && <Spinner />}

                {isRecordsError && (
                    <AlertCard
                        message={t(
                            'app.application.aragonProfileRenameDialog.recordsFetchError',
                        )}
                        variant="critical"
                    />
                )}

                {isProfileNotFound && (
                    <AlertCard
                        message={t(
                            'app.application.aragonProfileRenameDialog.profileNotFound',
                        )}
                        variant="critical"
                    />
                )}

                {allTextRecords != null && allTextRecords.length > 0 && (
                    <InputContainer
                        helpText={t(
                            'app.application.aragonProfileRenameDialog.fields.records.helpText',
                        )}
                        id="aragon-profile-rename-records"
                        label={t(
                            'app.application.aragonProfileRenameDialog.fields.records.label',
                        )}
                        useCustomWrapper
                    >
                        <DefinitionList.Container className="[&_dt]:break-all">
                            {allTextRecords.map(({ key, value }) => (
                                <DefinitionList.Item key={key} term={key}>
                                    <p className="wrap-break-word">{value}</p>
                                </DefinitionList.Item>
                            ))}
                        </DefinitionList.Container>
                    </InputContainer>
                )}
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
