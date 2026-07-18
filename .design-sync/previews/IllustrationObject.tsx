import { IllustrationObject } from '@aragon/gov-ui-kit';

export const Default = () => <IllustrationObject object="ACTION" style={{ width: 140 }} />;

export const GovernanceObjects = () => (
    <div className="flex flex-wrap items-center gap-4">
        <IllustrationObject object="WALLET" style={{ width: 100 }} />
        <IllustrationObject object="USERS" style={{ width: 100 }} />
        <IllustrationObject object="SMART_CONTRACT" style={{ width: 100 }} />
        <IllustrationObject object="SETTINGS" style={{ width: 100 }} />
        <IllustrationObject object="TIMELOCK" style={{ width: 100 }} />
        <IllustrationObject object="GOAL" style={{ width: 100 }} />
    </div>
);

export const FeedbackObjects = () => (
    <div className="flex flex-wrap items-center gap-4">
        <IllustrationObject object="SUCCESS" style={{ width: 100 }} />
        <IllustrationObject object="WARNING" style={{ width: 100 }} />
        <IllustrationObject object="ERROR" style={{ width: 100 }} />
        <IllustrationObject object="NOT_FOUND" style={{ width: 100 }} />
        <IllustrationObject object="MAGNIFYING_GLASS" style={{ width: 100 }} />
    </div>
);
