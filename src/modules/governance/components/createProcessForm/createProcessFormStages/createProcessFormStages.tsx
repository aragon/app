import type { ICreateProcessFormData } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { StageInput } from '@/modules/governance/components/createProcessForm/stageInput/stageInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';

export interface ICreateProcessFormStagesProps {}

export const CreateProcessFormStages: React.FC<ICreateProcessFormStagesProps> = () => {
    const { t } = useTranslations();
    const nameField = useFormField<ICreateProcessFormData, 'name'>('name', {
        label: 'Name',
        rules: { required: true },
        defaultValue: '',
    });

    return (
        <div className="flex flex-col gap-10">
            <StageInput name="stage" helpText={t('app.governance.createProcessForm.metadata.resources.helpText')} />
        </div>
    );
};
