'use client';

import type { IInputFileAvatarValue } from '@aragon/gov-ui-kit';
import {
    AlertCard,
    Button,
    Dialog,
    IconType,
    InputContainer,
    InputText,
    Link,
    TextArea,
} from '@aragon/gov-ui-kit';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type { TEnsRecordKey } from '@/modules/ens';
import {
    ensAvatarKey,
    ensRecordKeys,
    memberRegistrySubdomainSuffix,
    useEnsAvatar,
    useEnsName,
    useEnsProfileRecords,
} from '@/modules/ens';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { AvatarInput } from '@/shared/components/forms/avatarInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { socialHandleUtils } from '@/shared/utils/socialHandleUtils';
import { ApplicationDialogId } from '../../constants/applicationDialogId';
import { useWalletAccount } from '../../hooks/useWalletAccount';
import { AragonProfileSocialFieldRow } from './aragonProfileSocialFieldRow';

/** Form field names that correspond to social network ENS text records. */
export type SocialKey = Exclude<
    keyof IAragonProfileDialogFormData,
    'bio' | 'avatar'
>;

export interface IAragonProfileDialogFormData {
    /** ENS `description` text record. */
    bio: string;
    /** ENS avatar image. */
    avatar?: IInputFileAvatarValue;
    /** ENS `com.github` text record. */
    github: string;
    /** ENS `com.twitter` text record. */
    twitter: string;
    /** ENS `url` text record. */
    website: string;
    /** ENS `email` text record. */
    email: string;
    /** ENS `com.discord` text record. */
    discord: string;
    /** ENS `org.telegram` text record. */
    telegram: string;
}

const socialKeys: SocialKey[] = [
    'github',
    'twitter',
    'website',
    'email',
    'discord',
    'telegram',
];

/** Maps form field names to their corresponding ENS text-record keys. */
const fieldToEnsKey: Record<SocialKey | 'bio', string> = {
    bio: ensRecordKeys.description,
    github: ensRecordKeys.github,
    twitter: ensRecordKeys.twitter,
    website: ensRecordKeys.url,
    email: ensRecordKeys.email,
    discord: ensRecordKeys.discord,
    telegram: ensRecordKeys.telegram,
};

export interface IAragonProfileDialogParams {}

export interface IAragonProfileDialogProps
    extends IDialogComponentProps<IAragonProfileDialogParams> {}

export const AragonProfileDialog: React.FC<IAragonProfileDialogProps> = (
    props,
) => {
    const { location } = props;
    const { id } = location;

    const { t } = useTranslations();
    const { close, open } = useDialogContext();
    const { address } = useWalletAccount();

    const router = useRouter();
    const { network, addressOrEns } = useParams<{
        network?: string;
        addressOrEns?: string;
    }>();

    const { data: ensName } = useEnsName(address);
    const { data: ensAvatar } = useEnsAvatar(ensName);
    const { data: ensRecords } = useEnsProfileRecords(ensName);

    const formMethods = useForm<IAragonProfileDialogFormData>({
        mode: 'onTouched',
        defaultValues: {
            bio: '',
            avatar: undefined,
            github: '',
            twitter: '',
            website: '',
            email: '',
            discord: '',
            telegram: '',
        },
    });
    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { isDirty },
    } = formMethods;

    const bioField = useFormField<IAragonProfileDialogFormData, 'bio'>('bio', {
        label: t('app.application.aragonProfileDialog.fields.bio.label'),
        sanitizeMode: 'multiline',
        sanitizeOnBlur: true,
        trimOnBlur: true,
        control,
    });

    const [visibleSocials, setVisibleSocials] = useState<SocialKey[]>([]);

    useEffect(() => {
        if (ensRecords == null || isDirty) {
            return;
        }

        const values: IAragonProfileDialogFormData = {
            bio: ensRecords[ensRecordKeys.description] ?? '',
            avatar: ensAvatar ? { url: ensAvatar } : undefined,
            github: ensRecords[ensRecordKeys.github] ?? '',
            twitter: ensRecords[ensRecordKeys.twitter] ?? '',
            website: ensRecords[ensRecordKeys.url] ?? '',
            email: ensRecords[ensRecordKeys.email] ?? '',
            discord: ensRecords[ensRecordKeys.discord] ?? '',
            telegram: ensRecords[ensRecordKeys.telegram] ?? '',
        };

        reset(values);
        setVisibleSocials(socialKeys.filter((key) => values[key] !== ''));
    }, [ensAvatar, ensRecords, isDirty, reset]);

    if (address == null) {
        return null;
    }

    const hiddenSocials = socialKeys.filter(
        (key) => !visibleSocials.includes(key),
    );

    const handleAddSocial = (key: SocialKey) => {
        setVisibleSocials((prev) => [...prev, key]);
    };

    const handleRemoveSocial = (key: SocialKey) => {
        setVisibleSocials((prev) => prev.filter((k) => k !== key));
        setValue(key, '', { shouldDirty: true });
    };

    const handleCancel = () => close(id);

    const onSubmit = handleSubmit((data) => {
        if (ensName == null) {
            return;
        }

        // Store clean handles without a leading `@` for username-style records.
        const normalizedData = {
            ...data,
            twitter: socialHandleUtils.stripLeadingAt(data.twitter),
            telegram: socialHandleUtils.stripLeadingAt(data.telegram),
        };

        const updates: Record<string, string> = {};

        for (const [field, ensKey] of Object.entries(fieldToEnsKey)) {
            const formValue =
                normalizedData[field as keyof typeof fieldToEnsKey] ?? '';
            const existing = ensRecords?.[ensKey as TEnsRecordKey] ?? '';
            if (formValue !== existing) {
                updates[ensKey] = formValue;
            }
        }

        let avatarFile: File | undefined;
        if (data.avatar?.file != null) {
            avatarFile = data.avatar.file;
        } else if (data.avatar == null && ensAvatar != null) {
            updates[ensAvatarKey] = '';
        }

        if (Object.keys(updates).length === 0 && avatarFile == null) {
            return;
        }

        close(id);
        open(ApplicationDialogId.ARAGON_PROFILE_UPDATE, {
            params: {
                ensName,
                address,
                avatarSrc: data.avatar?.url,
                updates,
                avatarFile,
            },
        });
    });

    const isAragonName =
        ensName?.endsWith(memberRegistrySubdomainSuffix) ?? false;

    const handleRemoveAragonName = () => {
        if (ensName == null) {
            return;
        }
        open(ApplicationDialogId.ARAGON_PROFILE_RELEASE_ALERT, {
            params: { ensName },
            stack: true,
        });
    };

    const handleRenameAragonName = () => {
        if (ensName == null) {
            return;
        }
        open(ApplicationDialogId.ARAGON_PROFILE_RENAME, {
            params: { currentEnsName: ensName },
            stack: true,
        });
    };

    const handleViewProfile = () => {
        if (network == null || addressOrEns == null || address == null) {
            close();
            return;
        }

        router.push(`/dao/${network}/${addressOrEns}/members/${address}`);
        close();
    };

    const primaryLabel = isDirty
        ? t('app.application.aragonProfileDialog.actions.updateProfile')
        : t(
              // just confirm profile if outside the DAO context
              `app.application.aragonProfileDialog.actions.${addressOrEns ? 'viewProfile' : 'confirmProfile'}`,
          );

    return (
        <FormProvider {...formMethods}>
            <Dialog.Header
                description={t(
                    'app.application.aragonProfileDialog.description',
                )}
                onClose={handleCancel}
                title={t('app.application.aragonProfileDialog.title')}
            />
            <Dialog.Content className="flex flex-col gap-6 px-6 pt-4 pb-6">
                <div className="flex flex-col gap-3">
                    <InputText
                        disabled
                        helpText={t(
                            'app.application.aragonProfileDialog.fields.ensName.helpText',
                        )}
                        label={t(
                            'app.application.aragonProfileDialog.fields.ensName.label',
                        )}
                        value={ensName ?? ''}
                    />
                    {isAragonName && (
                        <Button
                            className="w-fit"
                            iconLeft={IconType.PEN}
                            onClick={handleRenameAragonName}
                            size="md"
                            variant="tertiary"
                        >
                            {t(
                                'app.application.aragonProfileDialog.actions.renameAragonName',
                            )}
                        </Button>
                    )}
                </div>

                <AvatarInput
                    label={t(
                        'app.application.aragonProfileDialog.fields.avatar.label',
                    )}
                    name="avatar"
                />

                <TextArea
                    id="aragon-profile-bio"
                    inputClassName="!min-h-24"
                    isOptional
                    maxLength={160}
                    {...bioField}
                />

                <InputContainer
                    id="aragon-profile-socials"
                    isOptional
                    label={t(
                        'app.application.aragonProfileDialog.fields.socials.label',
                    )}
                    useCustomWrapper
                >
                    <div className="flex flex-col gap-3">
                        {visibleSocials.map((key) => (
                            <AragonProfileSocialFieldRow
                                fieldName={key}
                                key={key}
                                onRemove={() => handleRemoveSocial(key)}
                            />
                        ))}
                        {hiddenSocials.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                                {hiddenSocials.map((key) => (
                                    <Button
                                        iconLeft={IconType.PLUS}
                                        key={key}
                                        onClick={() => handleAddSocial(key)}
                                        size="md"
                                        type="button"
                                        variant="tertiary"
                                    >
                                        {t(
                                            `app.application.aragonProfileDialog.fields.socials.${key}`,
                                        )}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </InputContainer>

                <AlertCard
                    message={t(
                        'app.application.aragonProfileDialog.alert.title',
                    )}
                    variant="info"
                >
                    <div className="flex flex-col gap-3">
                        <p className="text-base text-neutral-500 leading-normal">
                            {t(
                                'app.application.aragonProfileDialog.alert.description',
                            )}
                        </p>
                        <Link href="https://app.ens.domains" isExternal>
                            {t(
                                'app.application.aragonProfileDialog.alert.viewEns',
                            )}
                        </Link>
                    </div>
                </AlertCard>

                {isAragonName && (
                    <InputContainer
                        className="[&_label_div_p]:text-critical-800"
                        helpText={t(
                            'app.application.aragonProfileDialog.dangerZone.description',
                        )}
                        id="aragon-profile-danger-zone"
                        label={t(
                            'app.application.aragonProfileDialog.dangerZone.title',
                        )}
                        useCustomWrapper
                    >
                        <Button
                            className="w-fit"
                            onClick={handleRemoveAragonName}
                            size="md"
                            variant="critical"
                        >
                            {t(
                                'app.application.aragonProfileDialog.actions.removeAragonName',
                            )}
                        </Button>
                    </InputContainer>
                )}
            </Dialog.Content>

            <Dialog.Footer
                primaryAction={{
                    label: primaryLabel,
                    onClick: isDirty ? onSubmit : handleViewProfile,
                }}
                secondaryAction={{
                    label: t(
                        'app.application.aragonProfileDialog.actions.cancel',
                    ),
                    onClick: handleCancel,
                }}
            />
        </FormProvider>
    );
};
