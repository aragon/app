import type { ICreateProcessFormBodyNameProps } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { useBodyFields } from '@/modules/governance/components/createProcessForm/hooks/useBodyFields';
import { RadioCard, RadioGroup } from '@aragon/ods';
import { useFormContext } from 'react-hook-form';

export interface ICreateProcessFormPluginSelectProps extends ICreateProcessFormBodyNameProps {}

export const CreateProcessFormPluginSelect: React.FC<ICreateProcessFormPluginSelectProps> = (props) => {
    const { stageFieldName, bodyIndex } = props;

    const { setValue } = useFormContext();

    const { bodyGovernanceTypeField } = useBodyFields(stageFieldName, bodyIndex);

    return (
        <>
            <RadioGroup
                className="flex gap-4"
                helpText="What kind of governance would you like to add?"
                onValueChange={(value) => setValue(bodyGovernanceTypeField.name, value)}
                {...bodyGovernanceTypeField}
                defaultValue={bodyGovernanceTypeField.value}
            >
                <RadioCard
                    className="w-full"
                    label="Token voting"
                    description="Create or import an ERC-20 token"
                    value="tokenVoting"
                />
                <RadioCard
                    className="w-full"
                    label="Multisig"
                    description="Define which addresses are members"
                    value="multisig"
                />
            </RadioGroup>
        </>
    );
};
