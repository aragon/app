import { InputText, TextArea } from '@aragon/gov-ui-kit';
import { useWatch } from 'react-hook-form';
import { mainnet } from 'viem/chains';
import { getEnsAddress } from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import { Network } from '@/shared/api/daoService';
import { AvatarInput } from '@/shared/components/forms/avatarInput';
import { ResourcesInput } from '@/shared/components/forms/resourcesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { sanitizePlainText } from '@/shared/security';
import type { ICreateDaoFormData } from '../createDaoFormDefinitions';

export interface ICreateDaoFormMetadataProps {
    /**
     * Prefix to prepend to all the metadata form fields.
     */
    fieldPrefix?: string;
}

const nameMaxLength = 128;
const descriptionMaxLength = 480;
const ensMaxLength = 18;
const validSubdomain = /^[a-z0-9-]+$/;

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
    const networkValue = useWatch<Record<string, ICreateDaoFormData['network']>>({
        name: networkFieldName,
        defaultValue: undefined,
    });
    const isEthMainnet = networkValue === Network.ETHEREUM_MAINNET;

    const validateEnsField = async (value?: string) => {
        if (!value) {
            return undefined;
        }

        // Check if the value matches the valid pattern from the smart contract
        // https://github.com/aragon/osx/blob/b817881ec1fd381d823181c26d22f692696a6eeb/packages/contracts/src/framework/utils/RegistryUtils.sol
        if (!validSubdomain.test(value)) {
            return 'app.createDao.createDaoForm.metadata.ens.error.invalid';
        }

        try {
            const ensName = `${value}.dao.eth`;
            const ensAddress = await getEnsAddress(wagmiConfig, { name: ensName, chainId: mainnet.id });

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
        rules: { maxLength: ensMaxLength, validate: validateEnsField },
    });

    const descriptionField = useFormField<ICreateDaoFormData, 'description'>('description', {
        label: t('app.createDao.createDaoForm.metadata.description.label'),
        fieldPrefix,
        rules: { maxLength: descriptionMaxLength },
        trimOnBlur: true,
        sanitizeMode: 'multiline',
        defaultValue: '',
    });

    return (
        <div className="flex flex-col gap-10">
            <InputText maxLength={nameMaxLength} {...nameField} />
            {isEthMainnet && (
                <InputText
                    addon=".dao.eth"
                    addonPosition="right"
                    helpText={t('app.createDao.createDaoForm.metadata.ens.helpText')}
                    isOptional={true}
                    maxLength={ensMaxLength}
                    onChange={(e) => {
                        onChangeEnsField(sanitizePlainText(e.target.value).toLowerCase());
                    }}
                    value={ensValue}
                    wrapperClassName="w-full md:w-1/2"
                    {...ensField}
                />
            )}
            <AvatarInput fieldPrefix={fieldPrefix} name="avatar" />
            <TextArea
                helpText={t('app.createDao.createDaoForm.metadata.description.helpText')}
                isOptional={true}
                maxLength={descriptionMaxLength}
                {...descriptionField}
                value={(descriptionField.value as string | null | undefined) ?? ''}
            />
            <ResourcesInput
                fieldPrefix={fieldPrefix}
                helpText={t('app.createDao.createDaoForm.metadata.resources.helpText')}
                name="resources"
            />
        </div>
    );
};
