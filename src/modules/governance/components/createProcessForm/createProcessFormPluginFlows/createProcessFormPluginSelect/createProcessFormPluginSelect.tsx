import { useFormField } from '@/shared/hooks/useFormField';
import { RadioCard, RadioGroup } from '@aragon/ods';
import type { ICreateProcessFormBody } from '../../createProcessFormDefinitions';
import type { ICreateProcessFormBodyDialogStepsProps } from '../../createProcessFormStages/fields/stageBodiesField/stageBodiesFieldDefinitions';

export interface ICreateProcessFormPluginSelectProps extends ICreateProcessFormBodyDialogStepsProps {}

export const CreateProcessFormPluginSelect: React.FC<ICreateProcessFormPluginSelectProps> = (props) => {
    const { fieldPrefix } = props;

    const { onChange, ...governanceTypeField } = useFormField<ICreateProcessFormBody, 'governanceType'>(
        'governanceType',
        { label: 'Governance type', fieldPrefix },
    );

    return (
        <>
            <RadioGroup
                className="flex gap-4"
                helpText="What kind of governance would you like to add?"
                onValueChange={(value) => onChange(value)}
                defaultValue={governanceTypeField.value}
                {...governanceTypeField}
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
