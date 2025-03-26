import { MultisigSetupGovernance } from '@/plugins/multisigPlugin/components/multisigSetupGovernance';
import { useFormContext } from 'react-hook-form';
import type { ICreateProcessFormBodyDialogStepsProps } from '../../../createProcessFormStages/fields/stageBodiesField/stageBodiesFieldDefinitions';

export interface ICreateProcessFormMultisigParamsProps extends ICreateProcessFormBodyDialogStepsProps {}

export const CreateProcessFormMultisigParams: React.FC<ICreateProcessFormMultisigParamsProps> = (props) => {
    const { fieldPrefix } = props;

    const { watch } = useFormContext();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const members = watch(`${fieldPrefix}.members`);

    return (
        <MultisigSetupGovernance fieldPrefix={fieldPrefix} membersCount={Array.isArray(members) ? members.length : 0} />
    );
};
