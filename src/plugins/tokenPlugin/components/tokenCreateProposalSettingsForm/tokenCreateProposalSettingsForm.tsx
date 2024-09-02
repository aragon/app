import { useDaoSettings } from '@/shared/api/daoService';
import { AdvancedDateInput } from '@/shared/components/advancedDateInput';
import { useWatch } from 'react-hook-form';
import { type IDaoTokenSettings } from '../../types';

export interface ITokenCreateProposalSettingsFormProps {
    /**
     * The DAO ID.
     */
    daoId: string;
}

export const TokenCreateProposalSettingsForm: React.FC<ITokenCreateProposalSettingsFormProps> = ({ daoId }) => {
    const daoSettingsParams = { daoId };
    const { data: dao } = useDaoSettings<IDaoTokenSettings>({ urlParams: daoSettingsParams });
    const minDuration = dao?.settings.minDuration;

    const startDate = useWatch({ name: 'Start TimeDate' });
    const startTime = useWatch({ name: 'Start TimeTime' });
    console.debug('startDate', startDate);
    console.debug('startTime', startTime);
    return (
        <>
            <AdvancedDateInput
                label="Start Time"
                field="startTime"
                helpText="Define when a proposal should be active to receive approvals. If now is selected, the proposal is immediately active after publishing."
                useDuration={false}
                isStartField={true}
            />
            <AdvancedDateInput
                label="End Time"
                field="endTime"
                helpText="Define when a proposal should expire. After the expiration time, there is no way to approve or execute the proposal."
                useDuration={true}
                minDuration={minDuration ?? 0}
                startTime={startDate && startTime ? { date: startDate, time: startTime } : undefined}
                isStartField={false}
            />
        </>
    );
};

