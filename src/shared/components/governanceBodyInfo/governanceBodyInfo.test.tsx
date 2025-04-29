import { addressUtils } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { GovernanceBodyInfo, type IGovernanceBodyInfoProps } from './governanceBodyInfo';
import type { IPluginInfo } from '@/shared/types';

describe('<GovernanceBodyInfo /> component', () => {
    const createTestComponent = (props?: Partial<IGovernanceBodyInfoProps>) => {
        const completeProps: IGovernanceBodyInfoProps = {
            ...props,
        };

        return <GovernanceBodyInfo {...completeProps} />;
    };

    it('throws error if neither address nor pluginSubdomain is provided', () => {
        expect(() => render(createTestComponent())).toThrow();
    });

    it('renders the body name if present', () => {
        const name = 'Test Body';
        const pluginInfo = {
            name: 'test-plugin',
            installVersion: { release: 1, build: 2 },
        } as IPluginInfo;
        render(createTestComponent({ name, pluginInfo }));

        expect(screen.getByText(name)).toBeInTheDocument();
    });

    it('renders the plugin name & version when pluginInfo is present', () => {
        const pluginInfo = {
            name: 'Token Voting',
            installVersion: { release: 2, build: 4 },
        } as IPluginInfo;
        const address = '0xB017BB3D282a542Ef521F9052Eba61F1e79FC6E8';
        render(createTestComponent({ address, pluginInfo }));

        expect(screen.getByText('Token Voting v2.4')).toBeInTheDocument();
    });

    it('renders the name, address and external subtitle when both are defined', () => {
        const name = 'test.eth';
        const address = '0xB017BB3D282a542Ef521F9052Eba61F1e79FC6E8';
        render(createTestComponent({ name, address }));

        expect(screen.getByText(name)).toBeInTheDocument();
        expect(screen.getByText(addressUtils.truncateAddress(address))).toBeInTheDocument();
        expect(screen.getByText('app.shared.governanceBodyInfo.external')).toBeInTheDocument();
    });
});
