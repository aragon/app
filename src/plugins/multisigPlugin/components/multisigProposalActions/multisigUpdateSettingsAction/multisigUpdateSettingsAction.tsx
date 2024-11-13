import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { NumberProgressInput } from '@/shared/components/forms/numberProgressInput';
import type { IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import { useWatch } from 'react-hook-form';

export interface IMultisigUpdateSettingsActionProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction>> {}

export const MultisigUpdateSettingsAction: React.FC<IMultisigUpdateSettingsActionProps> = () => {
    const value = useWatch<Record<string, string>>({ name: 'test' });

    return <NumberProgressInput fieldName="test" valueLabel={value} total={100} totalLabel="total label" />;
};
