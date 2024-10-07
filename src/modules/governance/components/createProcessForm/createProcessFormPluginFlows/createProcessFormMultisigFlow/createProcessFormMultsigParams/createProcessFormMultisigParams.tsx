import { useBodyFields } from '@/modules/governance/components/createProcessForm/hooks/useBodyFields';
import { InputContainer, InputNumber } from '@aragon/ods';
import { useFormContext } from 'react-hook-form';

export interface ICreateProcessFormMultisigParamsProps {
    stageName: string;
    stageIndex: number;
    bodyIndex: number;
}

export const CreateProcessFormMultisigParams: React.FC<ICreateProcessFormMultisigParamsProps> = (props) => {
    const { stageName, stageIndex, bodyIndex } = props;
    const { watch } = useFormContext();
    const members = watch(`${stageName}.${stageIndex}.bodies.${bodyIndex}.members`);
    const { multisigThresholdField } = useBodyFields(stageName, stageIndex, bodyIndex);
    return (
        <>
            <InputContainer
                id="multisig-threshold"
                label="Approval Threshold"
                helpText="Number of approvals required to execute a proposal."
                useCustomWrapper={true}
            >
                <InputNumber
                    max={members?.length}
                    min={1}
                    suffix={`of ${members?.length}`}
                    placeholder="Enter a number"
                    {...multisigThresholdField}
                    label={undefined}
                />
            </InputContainer>
        </>
    );
};
