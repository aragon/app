import { InputNumberMax } from '@aragon/gov-ui-kit';

export const Default = () => (
    <InputNumberMax
        label="Amount to withdraw"
        max={12500}
        placeholder="0"
        helpText="Treasury balance: 12,500 ANT"
        className="w-full"
    />
);

export const WithValue = () => (
    <InputNumberMax label="Tokens to delegate" max={54120} value="1500" helpText="Your balance: 54,120 ANT" className="w-full" />
);

export const Critical = () => (
    <InputNumberMax
        label="Amount to send"
        max={12500}
        value="1200"
        variant="critical"
        alert={{ message: 'Amount exceeds the 1,000 ANT spending cap of this plugin.', variant: 'critical' }}
        className="w-full"
    />
);

export const Disabled = () => (
    <InputNumberMax
        label="Locked tokens"
        max={10000}
        value="10000"
        disabled={true}
        helpText="Tokens are locked until the voting period ends."
        className="w-full"
    />
);
