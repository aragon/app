import { MultisigSetupGovernance } from '@/plugins/multisigPlugin/components/multisigSetupGovernance';
import type { ICompositeAddress } from '@aragon/gov-ui-kit';
import { useWatch } from 'react-hook-form';
import type { ICreateProcessFormBodyDialogStepsProps } from '../../../createProcessFormStages/fields/stageBodiesField/stageBodiesFieldDefinitions';

export interface ICreateProcessFormMultisigParamsProps extends ICreateProcessFormBodyDialogStepsProps {}

export const CreateProcessFormMultisigParams: React.FC<ICreateProcessFormMultisigParamsProps> = (props) => {
    const { fieldPrefix } = props;

    const members = useWatch<Record<string, ICompositeAddress[] | undefined>>({ name: `${fieldPrefix}.members` }) ?? [];

    return <MultisigSetupGovernance fieldPrefix={fieldPrefix} membersCount={members.length} />;
};
