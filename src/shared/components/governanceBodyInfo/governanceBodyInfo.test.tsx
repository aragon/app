import type { IPluginInfo } from '@/shared/types';
import { addressUtils } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { GovernanceBodyInfo, type IGovernanceBodyInfoProps } from './governanceBodyInfo';

describe('<GovernanceBodyInfo /> component', () => {
    const createTestComponent = (props?: Partial<IGovernanceBodyInfoProps>) => {
        const completeProps: IGovernanceBodyInfoProps = {
            ...props,
        };

        return <GovernanceBodyInfo {...completeProps} />;
    };

    it('throws error if neither address nor pluginInfo is provided', () => {
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
            name: 'tokenVoting',
            installVersion: { release: 2, build: 4 },
        } as IPluginInfo;
        render(createTestComponent({ pluginInfo }));

        expect(screen.getByText('tokenVoting v2.4')).toBeInTheDocument();
    });

    it('renders the name, address and external subtitle when both are defined', () => {
        const name = 'test.eth';
        const address = '0xB017BB3D282a542Ef521F9052Eba61F1e79FC6E8';
        render(createTestComponent({ name, address }));

        expect(screen.getByText(name)).toBeInTheDocument();
        expect(screen.getByText(addressUtils.truncateAddress(address))).toBeInTheDocument();
        expect(screen.getByText(/governanceBodyInfo.external/)).toBeInTheDocument();
    });
});
