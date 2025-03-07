import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputNumber } from '@aragon/gov-ui-kit';
import { useFormContext } from 'react-hook-form';
import type { ICreateProcessFormBody } from '../../../createProcessFormDefinitions';
import type { ICreateProcessFormBodyDialogStepsProps } from '../../../createProcessFormStages/fields/stageBodiesField/stageBodiesFieldDefinitions';

export interface ICreateProcessFormMultisigParamsProps extends ICreateProcessFormBodyDialogStepsProps {}

export const CreateProcessFormMultisigParams: React.FC<ICreateProcessFormMultisigParamsProps> = (props) => {
    const { fieldPrefix } = props;

    const { t } = useTranslations();
    const keyNamespace = 'app.createDao.createProcessForm.multisigFlow.params';

    const { watch } = useFormContext();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const members = watch(`${fieldPrefix}.members`);

    const multisigThresholdField = useFormField<ICreateProcessFormBody, 'multisigThreshold'>('multisigThreshold', {
        label: t(`${keyNamespace}.label`),
        defaultValue: 1,
        fieldPrefix,
        rules: {
            required: t(`${keyNamespace}.required`),
            min: { value: 1, message: t(`${keyNamespace}.required`) },
        },
    });

    return (
        <InputNumber
            helpText={t(`${keyNamespace}.helpText`)}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            max={members?.length}
            min={1}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            suffix={t(`${keyNamespace}.suffix`, { members: members?.length as number })}
            placeholder={t(`${keyNamespace}.placeholder`)}
            {...multisigThresholdField}
        />
    );
};
