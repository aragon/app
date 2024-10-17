import { Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useFormField } from '@/shared/hooks/useFormField';
import { addressUtils, InputText, RadioCard, RadioGroup } from '@aragon/ods';
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
        defaultValue: '0x23b2070d5f8E7B55644D86a0603e72A53393f539',
    });

    const adminPluginRepoField = useFormField<ICreateDaoFormData, 'adminPluginRepo'>('adminPluginRepo', {
        label: t('app.createDao.createDaoForm.debug.adminPluginRepo.label'),
        rules: { required: true, validate: (value) => addressUtils.isAddress(value) },
        trimOnBlur: true,
        defaultValue: '0xEdA3074437375DC71007AFC9D421644656d72287',
    });

    return (
        <div className="flex flex-col gap-10">
            <RadioGroup helpText={t('app.createDao.createDaoForm.debug.network.helpText')} {...networkField}>
                <RadioCard
                    value={Network.ETHEREUM_SEPOLIA}
                    label={networkDefinitions[Network.ETHEREUM_SEPOLIA].name}
                    avatar={networkDefinitions[Network.ETHEREUM_SEPOLIA].logo}
                />
            </RadioGroup>
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
