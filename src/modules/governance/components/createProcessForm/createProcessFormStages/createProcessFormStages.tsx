import { StageInput } from '@/modules/governance/components/createProcessForm/stageInput/stageInput';

export interface ICreateProcessFormStagesProps {}

export const CreateProcessFormStages: React.FC<ICreateProcessFormStagesProps> = () => {
    return (
        <div className="flex flex-col gap-10">
            <StageInput name="stages" />
        </div>
    );
};
