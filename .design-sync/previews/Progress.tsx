import { Progress } from '@aragon/gov-ui-kit';

export const Default = () => (
    <div className="w-full">
        <Progress value={62} />
    </div>
);

export const Variants = () => (
    <div className="flex w-full flex-col gap-4">
        <Progress value={75} variant="primary" />
        <Progress value={64} variant="success" />
        <Progress value={35} variant="neutral" />
        <Progress value={12} variant="critical" />
    </div>
);

export const WithThresholdIndicator = () => (
    <div className="flex w-full flex-col gap-4">
        <Progress thresholdIndicator={50} value={72} variant="success" />
        <Progress thresholdIndicator={50} value={28} variant="critical" />
    </div>
);

export const Sizes = () => (
    <div className="flex w-full flex-col gap-4">
        <Progress size="md" value={55} />
        <Progress size="sm" value={55} />
    </div>
);
