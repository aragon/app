import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useFormContext } from 'react-hook-form';
import { SppProposalType } from '@/plugins/sppPlugin/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { ISetupBodyForm } from './setupBodyDialogDefinitions';

// The approve/veto choice is a per-body property of a stage, allowing a single
// stage to mix approving and vetoing bodies.
const optionToProposalType: Record<string, SppProposalType> = {
    approve: SppProposalType.APPROVAL,
    veto: SppProposalType.VETO,
};

const proposalTypeToOption = (type?: SppProposalType): string =>
    type === SppProposalType.VETO ? 'veto' : 'approve';

export const SetupBodyProposalTypeField: React.FC = () => {
    const { t } = useTranslations();
    const { control } = useFormContext<ISetupBodyForm>();

    const { value, onChange, ...proposalTypeField } = useFormField<
        ISetupBodyForm,
        'proposalType'
    >('proposalType', {
        label: t('app.createDao.setupBodyDialog.proposalTypeField.label'),
        defaultValue: SppProposalType.APPROVAL,
        control,
    });

    const handleChange = (option: string) => {
        onChange(optionToProposalType[option]);
    };

    return (
        <RadioGroup
            helpText={t(
                'app.createDao.setupBodyDialog.proposalTypeField.helpText',
            )}
            onValueChange={handleChange}
            value={proposalTypeToOption(value)}
            {...proposalTypeField}
        >
            {Object.keys(optionToProposalType).map((option) => (
                <RadioCard
                    description={t(
                        `app.createDao.setupBodyDialog.proposalTypeField.${option}.description`,
                    )}
                    key={option}
                    label={t(
                        `app.createDao.setupBodyDialog.proposalTypeField.${option}.label`,
                    )}
                    value={option}
                />
            ))}
        </RadioGroup>
    );
};
