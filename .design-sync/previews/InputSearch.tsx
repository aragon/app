import { InputSearch } from '@aragon/gov-ui-kit';

export const Default = () => (
    <InputSearch className="w-full" placeholder="Search proposals" />
);

export const WithValue = () => (
    <InputSearch
        className="w-full"
        defaultValue="0x47d8…9c1e"
        helpText="Search by address or ENS name."
        label="Members"
    />
);

export const Loading = () => (
    <InputSearch
        className="w-full"
        defaultValue="treasury diversification"
        isLoading={true}
    />
);

export const Disabled = () => (
    <InputSearch
        className="w-full"
        disabled={true}
        placeholder="Search delegates"
    />
);
