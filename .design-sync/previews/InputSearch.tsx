import { InputSearch } from '@aragon/gov-ui-kit';

export const Default = () => <InputSearch placeholder="Search proposals" className="w-full" />;

export const WithValue = () => (
    <InputSearch label="Members" defaultValue="0x47d8…9c1e" helpText="Search by address or ENS name." className="w-full" />
);

export const Loading = () => <InputSearch defaultValue="treasury diversification" isLoading={true} className="w-full" />;

export const Disabled = () => <InputSearch placeholder="Search delegates" disabled={true} className="w-full" />;
