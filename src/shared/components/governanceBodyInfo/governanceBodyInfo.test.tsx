import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { addressUtils } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { GovernanceBodyInfo, type IGovernanceBodyInfoProps } from './governanceBodyInfo';

describe('<GovernanceBodyInfo /> component', () => {
    const getSlotFunctionSpy = jest.spyOn(pluginRegistryUtils, 'getPlugin');

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
        const testBody = {
            name: 'Test Body',
            pluginSubdomain: 'test-plugin',
        };
        render(createTestComponent(testBody));

        expect(screen.getByText(testBody.name)).toBeInTheDocument();
    });

    it('renders the plugin name & version when pluginSubdomain is present', () => {
        const plugin = {
            id: 'test-plugin',
            name: 'TestPlugin',
            installVersion: { release: 2, build: 4 },
        };
        const address = '0xB017BB3D282a542Ef521F9052Eba61F1e79FC6E8';
        getSlotFunctionSpy.mockReturnValue(plugin);
        render(createTestComponent({ pluginSubdomain: plugin.id, address }));

        expect(screen.getByText('TestPlugin v2.4')).toBeInTheDocument();
    });

    it('renders the name, address and external subtitle when both are defined', () => {
        const testBody = {
            name: 'test.eth',
            address: '0xB017BB3D282a542Ef521F9052Eba61F1e79FC6E8',
        };
        render(createTestComponent(testBody));

        expect(screen.getByText(testBody.name)).toBeInTheDocument();
        expect(screen.getByText(addressUtils.truncateAddress(testBody.address))).toBeInTheDocument();
        expect(screen.getByText('app.shared.governanceBodyInfo.external')).toBeInTheDocument();
    });
});
