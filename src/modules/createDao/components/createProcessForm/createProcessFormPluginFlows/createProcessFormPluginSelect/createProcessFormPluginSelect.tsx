import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import type { ICreateProcessFormBody } from '../../createProcessFormDefinitions';
import type { ICreateProcessFormBodyDialogStepsProps } from '../../createProcessFormStages/fields/stageBodiesField/stageBodiesFieldDefinitions';

export interface ICreateProcessFormPluginSelectProps extends ICreateProcessFormBodyDialogStepsProps {}

export const CreateProcessFormPluginSelect: React.FC<ICreateProcessFormPluginSelectProps> = (props) => {
    const { fieldPrefix } = props;

    const { t } = useTranslations();

    const { onChange, ...governanceTypeField } = useFormField<ICreateProcessFormBody, 'governanceType'>(
        'governanceType',
        { label: t('app.createDao.createProcessForm.pluginSelect.label'), fieldPrefix },
    );

    return (
        <>
            <RadioGroup
                className="flex gap-4"
                helpText={t('app.createDao.createProcessForm.pluginSelect.helpText')}
                onValueChange={(value) => onChange(value)}
                defaultValue={governanceTypeField.value}
                {...governanceTypeField}
            >
                <RadioCard
                    className="w-full"
                    label="Token voting"
                    description={t('app.createDao.createProcessForm.pluginSelect.tokenDescription')}
                    value="token-voting"
                />
                <RadioCard
                    className="w-full"
                    label="Multisig"
                    description={t('app.createDao.createProcessForm.pluginSelect.multisigDescription')}
                    value="multisig"
                />
            </RadioGroup>
        </>
    );
};
