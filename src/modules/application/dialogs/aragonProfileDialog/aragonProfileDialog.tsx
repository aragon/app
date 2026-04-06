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
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useConnection } from 'wagmi';
import { useEnsAvatar, useEnsName, useEnsRecords } from '@/modules/ens';
import { ENS_RECORD_KEYS } from '@/modules/ens/constants/ensConfig';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { AvatarInput } from '@/shared/components/forms/avatarInput';
import { useTranslations } from '@/shared/components/translationsProvider';

type SocialKey = Exclude<keyof IAragonProfileDialogFormData, 'bio' | 'avatar'>;

interface IAragonProfileDialogFormData {
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

const SOCIAL_KEYS: SocialKey[] = [
    'github',
    'twitter',
    'website',
    'email',
    'discord',
    'telegram',
];

const EMPTY_DEFAULTS: IAragonProfileDialogFormData = {
    bio: '',
    avatar: undefined,
    github: '',
    twitter: '',
    website: '',
    email: '',
    discord: '',
    telegram: '',
};

/** Props for {@link AragonProfileDialog}. */
export interface IAragonProfileDialogProps extends IDialogComponentProps {}

export const AragonProfileDialog: React.FC<IAragonProfileDialogProps> = (
    props,
) => {
    const { id } = props.location;

    const { t } = useTranslations();
    const { close } = useDialogContext();
    const { address } = useConnection();

    const { data: ensName } = useEnsName(address);
    const { data: ensAvatar } = useEnsAvatar(ensName);
    const { data: ensRecords } = useEnsRecords(ensName);

    const methods = useForm<IAragonProfileDialogFormData>({
        defaultValues: EMPTY_DEFAULTS,
    });
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { isDirty },
    } = methods;

    const [visibleSocials, setVisibleSocials] = useState<SocialKey[]>([]);
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (ensRecords == null || hasInitialized.current) {
            return;
        }
        hasInitialized.current = true;

        const values: IAragonProfileDialogFormData = {
            bio: ensRecords[ENS_RECORD_KEYS.description] ?? '',
            avatar: ensAvatar ? { url: ensAvatar } : undefined,
            github: ensRecords[ENS_RECORD_KEYS.github] ?? '',
            twitter: ensRecords[ENS_RECORD_KEYS.twitter] ?? '',
            website: ensRecords[ENS_RECORD_KEYS.url] ?? '',
            email: ensRecords[ENS_RECORD_KEYS.email] ?? '',
            discord: ensRecords[ENS_RECORD_KEYS.discord] ?? '',
            telegram: ensRecords[ENS_RECORD_KEYS.telegram] ?? '',
        };

        reset(values);
        setVisibleSocials(SOCIAL_KEYS.filter((key) => values[key] !== ''));
    }, [ensAvatar, ensRecords, reset]);

    if (address == null) {
        return null;
    }

    const hiddenSocials = SOCIAL_KEYS.filter(
        (key) => !visibleSocials.includes(key),
    );

    const handleAddSocial = (key: SocialKey) => {
        setVisibleSocials((prev) => [...prev, key]);
    };

    const handleRemoveSocial = (key: SocialKey) => {
        setVisibleSocials((prev) => prev.filter((k) => k !== key));
        setValue(key, '');
    };

    const handleCancel = () => close(id);

    // TODO: implement ENS record update transaction
    const onSubmit = handleSubmit(() => undefined);

    const primaryLabel = isDirty
        ? t('app.application.aragonProfileDialog.actions.updateProfile')
        : t('app.application.aragonProfileDialog.actions.viewProfile');

    return (
        <FormProvider {...methods}>
            <Dialog.Header
                onClose={handleCancel}
                title={t('app.application.aragonProfileDialog.a11y.title')}
            />
            <Dialog.Content className="flex flex-col gap-6 px-6 pt-4 pb-6">
                <InputText
                    disabled
                    id="aragon-profile-ens-name"
                    label={t(
                        'app.application.aragonProfileDialog.fields.ensName.label',
                    )}
                    readOnly
                    value={ensName ?? ''}
                />

                <AvatarInput
                    label={t(
                        'app.application.aragonProfileDialog.fields.avatar.label',
                    )}
                    name="avatar"
                />

                <TextArea
                    id="aragon-profile-bio"
                    isOptional
                    label={t(
                        'app.application.aragonProfileDialog.fields.bio.label',
                    )}
                    maxLength={160}
                    {...register('bio')}
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
                            <div className="flex items-center gap-2" key={key}>
                                <InputText
                                    className="flex-1"
                                    id={`aragon-profile-social-${key}`}
                                    placeholder={t(
                                        `app.application.aragonProfileDialog.fields.socials.${key}`,
                                    )}
                                    prefix={'LLAL'}
                                    {...register(key)}
                                />
                                <Button
                                    iconLeft={IconType.CLOSE}
                                    onClick={() => handleRemoveSocial(key)}
                                    size="md"
                                    type="button"
                                    variant="tertiary"
                                />
                            </div>
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
            </Dialog.Content>

            <Dialog.Footer
                primaryAction={{
                    label: primaryLabel,
                    onClick: isDirty ? onSubmit : handleCancel,
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
