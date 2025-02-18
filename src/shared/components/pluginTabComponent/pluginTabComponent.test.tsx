import { generateTabComponentPlugin } from '@/shared/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { PluginTabComponent } from './pluginTabComponent';
import type { IPluginTabComponentProps } from './pluginTabComponent.api';

describe('<PluginTabComponent /> component', () => {
    const getSlotComponentSpy = jest.spyOn(pluginRegistryUtils, 'getSlotComponent');

    afterEach(() => {
        getSlotComponentSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IPluginTabComponentProps>) => {
        const completeProps: IPluginTabComponentProps = {
            slotId: 'slot-id',
            ...props,
        };

        return <PluginTabComponent {...completeProps} />;
    };

    it('returns empty container when no plugin component is found and fallback is not specified', () => {
        const plugins = [generateTabComponentPlugin()];
        getSlotComponentSpy.mockReturnValue(undefined);
        const { container } = render(createTestComponent({ plugins }));
        expect(container).toBeEmptyDOMElement();
    });

    it('renders a single component without tabs when the slot has one component registered', () => {
        const plugins = [generateTabComponentPlugin()];
        const component = () => <div data-testid="component-mock" />;
        getSlotComponentSpy.mockReturnValue(component);
        render(createTestComponent({ plugins }));
        expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
        expect(screen.getByTestId('component-mock')).toBeInTheDocument();
    });

    it('renders a single component without tabs when the fallback component is specified and plugins array has one element', () => {
        const plugins = [generateTabComponentPlugin()];
        const registeredComponent = undefined;
        const Fallback = () => <div data-testid="fallback-mock" />;
        getSlotComponentSpy.mockReturnValue(registeredComponent);
        render(createTestComponent({ plugins, Fallback }));
        expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
        expect(screen.getByTestId('fallback-mock')).toBeInTheDocument();
    });

    it('renders the same fallback inside tabs when having multiple unsupported plugins', () => {
        const plugins = [
            generateTabComponentPlugin({ id: 'one', uniqueId: '1', label: 'one' }),
            generateTabComponentPlugin({ id: 'two', uniqueId: '2', label: 'two' }),
        ];
        const registeredComponent = undefined;
        const Fallback = () => <div data-testid="fallback-mock" />;
        getSlotComponentSpy.mockReturnValue(registeredComponent);
        render(createTestComponent({ plugins, Fallback }));
        expect(screen.getByRole('tablist')).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: plugins[0].label })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: plugins[1].label })).toBeInTheDocument();
        expect(screen.getByTestId('fallback-mock')).toBeInTheDocument();
    });

    it('renders all the slot components as tabs when having multiple slot components registered', () => {
        const plugins = [
            generateTabComponentPlugin({ id: 'token', uniqueId: '1', label: 'Token' }),
            generateTabComponentPlugin({ id: 'multisig', uniqueId: '2', label: 'Multisig' }),
        ];
        const tokenComponent = () => <div data-testid="token-component" />;
        const multisigComponent = () => <div data-testid="multisig-component" />;
        getSlotComponentSpy.mockImplementation((params: { pluginId: string }) =>
            params.pluginId === 'token' ? tokenComponent : multisigComponent,
        );
        render(createTestComponent({ plugins }));
        expect(screen.getByRole('tablist')).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: plugins[0].label })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: plugins[1].label })).toBeInTheDocument();
        expect(screen.getByTestId('token-component')).toBeInTheDocument();
    });

it('updates the active tab and calls the onValueChange property on tab click', async () => {
    const onValueChange = jest.fn();
    const plugins = [
        generateTabComponentPlugin({ id: '1', uniqueId: '1', label: 'plugin1' }),
        generateTabComponentPlugin({ id: '2', uniqueId: '2', label: 'plugin2' }),
    ];
    getSlotComponentSpy.mockImplementation((params: { pluginId: string }) => () => `component-${params.pluginId}`);
    render(createTestComponent({ plugins, onValueChange }));

    expect(screen.getByText('component-1')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: plugins[1].label }));
    expect(screen.getByText('component-2')).toBeInTheDocument();
    expect(onValueChange).toHaveBeenCalledWith(plugins[1]);
});

});
