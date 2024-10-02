import { IDateDuration } from '@/shared/utils/dateUtils';
import { Button, DefinitionList, Tag } from '@aragon/ods';

interface CreateProcessFormTimingSummaryProps {
    votingPeriodField: any;
    earlyStageField: any;
    stageExpirationField: any;
    stageExpirationPeriodField: any;
    typeFieldValue: string;
    onEditTimingClick: () => void;
}

export const CreateProcessFormTimingSummary: React.FC<CreateProcessFormTimingSummaryProps> = ({
    votingPeriodField,
    earlyStageField,
    stageExpirationField,
    stageExpirationPeriodField,
    typeFieldValue,
    onEditTimingClick,
}) => {
    return (
        <>
            <DefinitionList.Container className="rounded-xl border border-neutral-100 px-6 py-4">
                <DefinitionList.Item term="Voting period">
                    {`${(votingPeriodField.value as IDateDuration).days} days, ${
                        (votingPeriodField.value as IDateDuration).hours
                    } hours, ${(votingPeriodField.value as IDateDuration).minutes} minutes`}
                </DefinitionList.Item>
                {typeFieldValue === 'normal' && (
                    <DefinitionList.Item term="Early stage advance">
                        <Tag
                            className="w-fit"
                            label={earlyStageField.value === true ? 'Yes' : 'No'}
                            variant={earlyStageField.value === true ? 'primary' : 'neutral'}
                        />
                    </DefinitionList.Item>
                )}
                <DefinitionList.Item term="Stage expiration">
                    <Tag
                        className="w-fit"
                        label={stageExpirationField.value === true ? 'Yes' : 'No'}
                        variant={stageExpirationField.value === true ? 'primary' : 'neutral'}
                    />
                </DefinitionList.Item>
                {stageExpirationField.value && (
                    <DefinitionList.Item term="Expiration period">
                        {`${(stageExpirationPeriodField.value as IDateDuration).days} days, ${
                            (stageExpirationPeriodField.value as IDateDuration).hours
                        } hours, ${(stageExpirationPeriodField.value as IDateDuration).minutes} minutes`}
                    </DefinitionList.Item>
                )}
            </DefinitionList.Container>
            <Button onClick={onEditTimingClick} variant="tertiary" size="md" className="w-fit">
                Edit timing
            </Button>
        </>
    );
};
