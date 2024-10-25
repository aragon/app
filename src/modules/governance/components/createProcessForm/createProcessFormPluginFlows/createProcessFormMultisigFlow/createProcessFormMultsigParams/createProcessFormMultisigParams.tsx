import type { ICreateProcessFormBody } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputNumber } from '@aragon/gov-ui-kit';
import { useFormContext } from 'react-hook-form';
import type { ICreateProcessFormBodyDialogStepsProps } from '../../../createProcessFormStages/fields/stageBodiesField/stageBodiesFieldDefinitions';

export interface ICreateProcessFormMultisigParamsProps extends ICreateProcessFormBodyDialogStepsProps {}

export const CreateProcessFormMultisigParams: React.FC<ICreateProcessFormMultisigParamsProps> = (props) => {
    const { fieldPrefix } = props;

    const { watch } = useFormContext();
    const members = watch(`${fieldPrefix}.members`);

    const multisigThresholdField = useFormField<ICreateProcessFormBody, 'multisigThreshold'>('multisigThreshold', {
        label: 'Approval Threshold',
        defaultValue: 1,
        rules: {
            required: 'Threshold must be at least 1',
            min: { value: 1, message: 'Threshold must be at least 1' },
        },
    });

    return (
        <InputNumber
            label="Approval Threshold"
            helpText="Number of approvals required to execute a proposal."
            max={members?.length}
            min={1}
            suffix={`of ${members?.length}`}
            placeholder="Enter a number"
            {...multisigThresholdField}
        />
    );
};
