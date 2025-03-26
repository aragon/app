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

    const { watch } = useFormContext();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const members = watch(`${fieldPrefix}.members`);

    const multisigThresholdField = useFormField<ICreateProcessFormBody, 'minApprovals'>('minApprovals', {
        label: t('app.createDao.createProcessForm.multisigFlow.params.label'),
        defaultValue: 1,
        fieldPrefix,
        rules: {
            required: t('app.createDao.createProcessForm.multisigFlow.params.required'),
            min: { value: 1, message: t('app.createDao.createProcessForm.multisigFlow.params.required') },
        },
    });

    return (
        <InputNumber
            helpText={t('app.createDao.createProcessForm.multisigFlow.params.helpText')}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            max={members?.length}
            min={1}
            suffix={t('app.createDao.createProcessForm.multisigFlow.params.suffix', {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                members: members?.length as number,
            })}
            placeholder={t('app.createDao.createProcessForm.multisigFlow.params.placeholder')}
            {...multisigThresholdField}
        />
    );
};
