import dynamic from 'next/dynamic';

export const TokenUpdateSettingsAction = dynamic(() =>
    import('./tokenUpdateSettingsAction').then((mod) => mod.TokenUpdateSettingsAction),
);

export type { ITokenUpdateSettingsActionProps } from './tokenUpdateSettingsAction';
