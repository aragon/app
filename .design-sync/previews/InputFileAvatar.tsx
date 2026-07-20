import { InputFileAvatar } from '@aragon/gov-ui-kit';

const noop = () => undefined;

const daoLogoUrl =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' fill='%233B82F6'/><circle cx='32' cy='32' r='14' fill='white'/></svg>";

export const Default = () => (
    <InputFileAvatar
        helpText="JPG, PNG or SVG of max. 2MiB"
        label="DAO logo"
        maxFileSize={2 * 1024 ** 2}
        onChange={noop}
    />
);

export const WithValue = () => (
    <InputFileAvatar
        helpText="Square images work best."
        label="DAO logo"
        onChange={noop}
        value={{ url: daoLogoUrl }}
    />
);

export const Critical = () => (
    <InputFileAvatar
        alert={{
            message: 'The selected file exceeds the 2MiB size limit.',
            variant: 'critical',
        }}
        label="Proposal cover image"
        onChange={noop}
        variant="critical"
    />
);

export const Disabled = () => (
    <InputFileAvatar
        disabled={true}
        helpText="Managed by the token contract metadata."
        label="Token icon"
        onChange={noop}
    />
);
