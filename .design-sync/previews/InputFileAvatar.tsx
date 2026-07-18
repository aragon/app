import { InputFileAvatar } from '@aragon/gov-ui-kit';

const noop = () => undefined;

const daoLogoUrl =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' fill='%233B82F6'/><circle cx='32' cy='32' r='14' fill='white'/></svg>";

export const Default = () => (
    <InputFileAvatar label="DAO logo" helpText="JPG, PNG or SVG of max. 2MiB" onChange={noop} maxFileSize={2 * 1024 ** 2} />
);

export const WithValue = () => (
    <InputFileAvatar label="DAO logo" helpText="Square images work best." onChange={noop} value={{ url: daoLogoUrl }} />
);

export const Critical = () => (
    <InputFileAvatar
        label="Proposal cover image"
        variant="critical"
        alert={{ message: 'The selected file exceeds the 2MiB size limit.', variant: 'critical' }}
        onChange={noop}
    />
);

export const Disabled = () => (
    <InputFileAvatar label="Token icon" helpText="Managed by the token contract metadata." disabled={true} onChange={noop} />
);
