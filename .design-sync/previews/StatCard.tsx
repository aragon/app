import { StatCard } from '@aragon/gov-ui-kit';

export const Default = () => (
    <div className="max-w-xs">
        <StatCard label="Active proposals" value={12} />
    </div>
);

export const WithSuffix = () => (
    <div className="max-w-xs">
        <StatCard label="Treasury value" suffix=" USD" value="4.2M" />
    </div>
);

export const StatsGrid = () => (
    <div className="grid w-full max-w-xl grid-cols-2 gap-3">
        <StatCard label="Proposals created" value={96} />
        <StatCard label="Participation" suffix="%" value={64} />
        <StatCard label="Token holders" suffix="k" value="3.4" />
        <StatCard label="Executed this quarter" value={14} />
    </div>
);
