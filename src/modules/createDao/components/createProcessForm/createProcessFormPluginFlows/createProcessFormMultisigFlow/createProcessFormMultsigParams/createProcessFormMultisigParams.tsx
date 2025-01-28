import { useFormField } from '@/shared/hooks/useFormField';
import { InputNumber } from '@aragon/gov-ui-kit';
import { useFormContext } from 'react-hook-form';
import type { ICreateProcessFormBody } from '../../../createProcessFormDefinitions';
import type { ICreateProcessFormBodyDialogStepsProps } from '../../../createProcessFormStages/fields/stageBodiesField/stageBodiesFieldDefinitions';

export interface ICreateProcessFormMultisigParamsProps extends ICreateProcessFormBodyDialogStepsProps {}

export const CreateProcessFormMultisigParams: React.FC<ICreateProcessFormMultisigParamsProps> = (props) => {
    const { fieldPrefix } = props;

    const { watch } = useFormContext();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const members = watch(`${fieldPrefix}.members`);

    const multisigThresholdField = useFormField<ICreateProcessFormBody, 'multisigThreshold'>('multisigThreshold', {
        label: 'Approval Threshold',
        defaultValue: 1,
        fieldPrefix,
        rules: {
            required: 'Threshold must be at least 1',
            min: { value: 1, message: 'Threshold must be at least 1' },
        },
    });

    return (
        <InputNumber
            label="Approval Threshold"
            helpText="Number of approvals required to execute a proposal."
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            max={members?.length}
            min={1}
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
            suffix={`of ${members?.length}`}
            placeholder="Enter a number"
            {...multisigThresholdField}
        />
    );
};
