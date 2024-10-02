// MultisigStep2.tsx
import { ITokenVotingMember } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { InputContainer, InputNumber } from '@aragon/ods';

interface ICreateProcessFormMultisigParams {
    multisigThresholdField: any;
    members: ITokenVotingMember[];
    setValue: any;
}

export const CreateProcessFormMultisigParams: React.FC<ICreateProcessFormMultisigParams> = ({
    multisigThresholdField,
    members,
    setValue,
}) => {
    return (
        <>
            <InputContainer
                id="multisig-threshold"
                label="Approval Threshold"
                helpText="Number of approvals required to execute a proposal."
                useCustomWrapper={true}
            >
                <InputNumber
                    max={members.length}
                    suffix={`of ${members.length}`}
                    placeholder="Enter a number"
                    onValueChange={(value: string) => setValue(multisigThresholdField.name, value)}
                    {...multisigThresholdField}
                    label={undefined}
                />
            </InputContainer>
        </>
    );
};
