import { MultisigSetupMembership } from '@/plugins/multisigPlugin/components/multisigSetupMembership';
import type { ICreateProcessFormBodyDialogStepsProps } from '../../../createProcessFormStages/fields/stageBodiesField/stageBodiesFieldDefinitions';

export interface ICreateProcessFormMultisigMembershipProps extends ICreateProcessFormBodyDialogStepsProps {}

export const CreateProcessFormMultisigMembership: React.FC<ICreateProcessFormMultisigMembershipProps> = (props) => {
    const { fieldPrefix } = props;

    return <MultisigSetupMembership formPrefix={fieldPrefix} />;
};
