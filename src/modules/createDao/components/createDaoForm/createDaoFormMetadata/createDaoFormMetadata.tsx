import { wagmiConfig } from '@/modules/application/constants/wagmi';
import { Network } from '@/shared/api/daoService';
import { ResourcesInput } from '@/shared/components/forms/resourcesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputContainer, InputFileAvatar, InputText, TextArea } from '@aragon/gov-ui-kit';
import { useWatch } from 'react-hook-form';
import { getEnsAddress } from 'wagmi/actions';
import type { ICreateDaoFormData } from '../createDaoFormDefinitions';

export interface ICreateDaoFormMetadataProps {
    /**
     * Prefix to prepend to all the metadata form fields.
     */
    fieldPrefix?: string;
}

const nameMaxLength = 128;
const descriptionMaxLength = 480;
const maxAvatarFileSize = 1 * 1024 * 1024; // 1 MB in bytes
const maxAvatarDimension = 1024;
const ensMaxLength = 18;

export const CreateDaoFormMetadata: React.FC<ICreateDaoFormMetadataProps> = (props) => {
    const { fieldPrefix } = props;

    const { t } = useTranslations();

    const nameField = useFormField<ICreateDaoFormData, 'name'>('name', {
        label: t('app.createDao.createDaoForm.metadata.name.label'),
        fieldPrefix,
        rules: { required: true, maxLength: nameMaxLength },
        trimOnBlur: true,
        defaultValue: '',
    });

    // Watch network field to decide whether or not to show ENS field
    const networkFieldName = fieldPrefix ? `${fieldPrefix}.network` : 'network';
    const networkValue = useWatch<Record<string, ICreateDaoFormData['network']>>({ name: networkFieldName });
    const isEthMainnet = networkValue === Network.ETHEREUM_MAINNET;

    const validateEnsField = async (ensName: string) => {
        try {
            if (ensName.includes(' ') || ensName.includes('_')) {
                return 'app.createDao.createDaoForm.metadata.ens.error.invalid';
            }

            const ensAddress = await getEnsAddress(wagmiConfig, {
                name: `${ensName}.dao.eth`,
                chainId: 1,
            });

            return ensAddress ? 'app.createDao.createDaoForm.metadata.ens.error.taken' : undefined;
        } catch {
            return 'app.createDao.createDaoForm.metadata.ens.error.invalid';
        }
    };

    const {
        value: ensValue,
        onChange: onChangeEnsField,
        ...ensField
    } = useFormField<ICreateDaoFormData, 'ens'>('ens', {
        label: t('app.createDao.createDaoForm.metadata.ens.label'),
        fieldPrefix,
        trimOnBlur: true,
        defaultValue: '',
        rules: { maxLength: ensMaxLength, validate: (value) => (value ? validateEnsField(value) : undefined) },
    });

    const { value, ...avatarField } = useFormField<ICreateDaoFormData, 'avatar'>('avatar', {
        label: t('app.createDao.createDaoForm.metadata.avatar.label'),
        fieldPrefix,
        rules: {
            validate: (value) =>
                value?.error ? `app.createDao.createDaoForm.metadata.avatar.error.${value.error}` : undefined,
        },
    });

    // Watch the avatar field to properly update the InputFileAvatar component when its value changes
    const avatarFieldName = fieldPrefix ? `${fieldPrefix}.avatar` : 'avatar';
    const avatarValue = useWatch<Record<string, ICreateDaoFormData['avatar']>>({ name: avatarFieldName });

    const descriptionField = useFormField<ICreateDaoFormData, 'description'>('description', {
        label: t('app.createDao.createDaoForm.metadata.description.label'),
        fieldPrefix,
        rules: { maxLength: descriptionMaxLength },
        trimOnBlur: true,
        defaultValue: '',
    });

    return (
        <div className="flex flex-col gap-10">
            <InputText maxLength={nameMaxLength} {...nameField} />
            {isEthMainnet && (
                <InputContainer
                    id="ensField"
                    helpText={t('app.createDao.createDaoForm.metadata.ens.helpText')}
                    isOptional={true}
                    useCustomWrapper={true}
                    {...ensField}
                >
                    <InputText
                        value={ensValue}
                        onChange={(e) => {
                            onChangeEnsField(e.target.value.toLowerCase());
                        }}
                        className="w-full md:w-1/2"
                        addon=".dao.eth"
                        addonPosition="right"
                        maxLength={ensMaxLength}
                    />
                </InputContainer>
            )}

            <InputFileAvatar
                value={avatarValue}
                helpText={t('app.createDao.createDaoForm.metadata.avatar.helpText')}
                maxDimension={maxAvatarDimension}
                maxFileSize={maxAvatarFileSize}
                isOptional={true}
                {...avatarField}
            />
            <TextArea
                helpText={t('app.createDao.createDaoForm.metadata.description.helpText')}
                maxLength={descriptionMaxLength}
                isOptional={true}
                {...descriptionField}
            />
            <ResourcesInput
                name="resources"
                fieldPrefix={fieldPrefix}
                helpText={t('app.createDao.createDaoForm.metadata.resources.helpText')}
            />
        </div>
    );
};
