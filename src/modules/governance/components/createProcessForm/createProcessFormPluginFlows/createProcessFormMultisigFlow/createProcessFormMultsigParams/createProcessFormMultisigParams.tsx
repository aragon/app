import type { ICreateProcessFormBodyNameProps } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { useBodyFields } from '@/modules/governance/components/createProcessForm/hooks/useBodyFields';
import { InputNumber } from '@aragon/ods';
import { useFormContext } from 'react-hook-form';

export interface ICreateProcessFormMultisigParamsProps extends ICreateProcessFormBodyNameProps {}

export const CreateProcessFormMultisigParams: React.FC<ICreateProcessFormMultisigParamsProps> = (props) => {
    const { stageFieldName, bodyIndex } = props;
    const { watch } = useFormContext();
    const members = watch(`${stageFieldName}.bodies.${bodyIndex}.members`);
    const { multisigThresholdField } = useBodyFields(stageFieldName, bodyIndex);

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
