import { Card } from '@aragon/gov-ui-kit';

export const Default = () => (
    <Card className="w-full p-6">
        <p className="font-semibold text-neutral-800">Treasury</p>
        <p className="text-neutral-500 text-sm">3 assets worth $1.2M held by the DAO.</p>
    </Card>
);

export const WithStructuredContent = () => (
    <Card className="w-full p-6">
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <p className="font-semibold text-neutral-800">Voting settings</p>
                <p className="text-neutral-500 text-sm">Token voting</p>
            </div>
            <div className="flex items-center justify-between">
                <p className="text-neutral-500 text-sm">Support threshold</p>
                <p className="text-neutral-800 text-sm">&gt; 50%</p>
            </div>
            <div className="flex items-center justify-between">
                <p className="text-neutral-500 text-sm">Minimum participation</p>
                <p className="text-neutral-800 text-sm">15%</p>
            </div>
            <div className="flex items-center justify-between">
                <p className="text-neutral-500 text-sm">Voting duration</p>
                <p className="text-neutral-800 text-sm">7 days</p>
            </div>
        </div>
    </Card>
);
