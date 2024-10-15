import { Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useFormField } from '@/shared/hooks/useFormField';
import { addressUtils, InputContainer, InputText, Toggle, ToggleGroup } from '@aragon/ods';
import { ICreateDaoFormData } from '../createDaoFormDefinitions';

export interface ICreateDaoFormDebugProps {}

export const CreateDaoFormDebug: React.FC<ICreateDaoFormDebugProps> = () => {
    const { t } = useTranslations();

    const { ref, ...networkField } = useFormField<ICreateDaoFormData, 'network'>('network', {
        label: t('app.createDao.createDaoForm.debug.network.label'),
        rules: { required: true },
        defaultValue: Network.ETHEREUM_SEPOLIA,
    });

    const factoryAddressField = useFormField<ICreateDaoFormData, 'factoryAddress'>('factoryAddress', {
        label: t('app.createDao.createDaoForm.debug.factoryAddress.label'),
        rules: { required: true, validate: (value) => addressUtils.isAddress(value) },
        trimOnBlur: true,
        defaultValue: '0x7a62da7B56fB3bfCdF70E900787010Bc4c9Ca42e',
    });

    const adminPluginRepoField = useFormField<ICreateDaoFormData, 'adminPluginRepo'>('adminPluginRepo', {
        label: t('app.createDao.createDaoForm.debug.adminPluginRepo.label'),
        rules: { required: true, validate: (value) => addressUtils.isAddress(value) },
        trimOnBlur: true,
        defaultValue: '0x152c9E28995E418870b85cbbc0AEE4e53020edb2',
    });

    return (
        <div className="flex flex-col gap-10">
            <InputContainer
                id={networkField.name}
                useCustomWrapper={true}
                label={t('app.createDao.createDaoForm.debug.network.label')}
                helpText={t('app.createDao.createDaoForm.debug.network.helpText')}
            >
                <ToggleGroup isMultiSelect={false} {...networkField}>
                    {Object.values(Network).map((network) => (
                        <Toggle
                            key={network}
                            value={network}
                            label={networkDefinitions[network as Network].name}
                            disabled={network !== Network.ETHEREUM_SEPOLIA}
                        />
                    ))}
                </ToggleGroup>
            </InputContainer>
            <InputText
                helpText={t('app.createDao.createDaoForm.debug.factoryAddress.helpText')}
                placeholder={t('app.createDao.createDaoForm.debug.factoryAddress.placeholder')}
                {...factoryAddressField}
            />
            <InputText
                helpText={t('app.createDao.createDaoForm.debug.adminPluginRepo.helpText')}
                placeholder={t('app.createDao.createDaoForm.debug.adminPluginRepo.placeholder')}
                {...adminPluginRepoField}
            />
        </div>
    );
};
