import { useFormField } from '@/shared/hooks/useFormField';
import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
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
                helpText="This determines the governance the body uses to make decisions."
                onValueChange={(value) => onChange(value)}
                defaultValue={governanceTypeField.value}
                {...governanceTypeField}
            >
                <RadioCard
                    className="w-full"
                    label="Token voting"
                    description="Majority voting based on token voting power"
                    value="token-voting"
                />
                <RadioCard
                    className="w-full"
                    label="Multisig"
                    description="Designated members must reach a minimum approval threshold"
                    value="multisig"
                />
            </RadioGroup>
        </>
    );
};
