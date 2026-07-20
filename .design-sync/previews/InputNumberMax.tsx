import { InputNumberMax } from '@aragon/gov-ui-kit';

export const Default = () => (
    <InputNumberMax
        className="w-full"
        helpText="Treasury balance: 12,500 ANT"
        label="Amount to withdraw"
        max={12_500}
        placeholder="0"
    />
);

export const WithValue = () => (
    <InputNumberMax
        className="w-full"
        helpText="Your balance: 54,120 ANT"
        label="Tokens to delegate"
        max={54_120}
        value="1500"
    />
);

export const Critical = () => (
    <InputNumberMax
        alert={{
            message:
                'Amount exceeds the 1,000 ANT spending cap of this plugin.',
            variant: 'critical',
        }}
        className="w-full"
        label="Amount to send"
        max={12_500}
        value="1200"
        variant="critical"
    />
);

export const Disabled = () => (
    <InputNumberMax
        className="w-full"
        disabled={true}
        helpText="Tokens are locked until the voting period ends."
        label="Locked tokens"
        max={10_000}
        value="10000"
    />
);
