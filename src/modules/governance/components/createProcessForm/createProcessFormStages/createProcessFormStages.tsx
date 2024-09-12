import { StageInput } from '@/modules/governance/components/createProcessForm/stageInput/stageInput';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface ICreateProcessFormStagesProps {}

export const CreateProcessFormStages: React.FC<ICreateProcessFormStagesProps> = () => {
    const { t } = useTranslations();
    return (
        <div className="flex flex-col gap-10">
            <StageInput name="stage" helpText={t('app.governance.createProcessForm.metadata.resources.helpText')} />
        </div>
    );
};
