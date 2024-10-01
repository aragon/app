import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { render, screen } from '@testing-library/react';
import { PluginComponent, type IPluginComponentProps } from './pluginComponent';

describe('<PluginComponent />', () => {
    const getSlotComponentSpy = jest.spyOn(pluginRegistryUtils, 'getSlotComponent');

    afterEach(() => {
        getSlotComponentSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IPluginComponentProps>) => {
        const completeProps: IPluginComponentProps = {
            slotId: 'test',
            pluginIds: [],
            ...props,
        };

        return <PluginComponent {...completeProps} />;
    };

    it('renders the registered slot component for the given plugin-id and slot-id`', () => {
        const pluginId = 'plugin-id';
        const slotId = 'slot-id';
        const slotComponent = () => <div data-testid="slot-component-test" />;
        getSlotComponentSpy.mockReturnValue(slotComponent);
        render(createTestComponent({ pluginIds: [pluginId], slotId }));

        expect(getSlotComponentSpy).toHaveBeenCalledWith({ slotId, pluginId });
        expect(screen.getByTestId('slot-component-test')).toBeInTheDocument();
    });

    it('returns null when no slot component is found and no children are provided', () => {
        getSlotComponentSpy.mockReturnValue(undefined);
        const { container } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();
    });

    it('only renders the first non-null slot component found', () => {
        const pluginIds = ['unknown', 'multisig', 'tokenVoting'];
        const slotId = 'member-list';
        getSlotComponentSpy
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(() => <div data-testid="multisig-slot-component" />)
            .mockReturnValueOnce(() => <div data-testid="tokenvoting-slot-component" />);
        render(createTestComponent({ pluginIds, slotId }));

        expect(screen.getByTestId('multisig-slot-component')).toBeInTheDocument();
        expect(screen.queryByTestId('tokenvoting-slot-component')).not.toBeInTheDocument();
    });

    it('renders the fallback component when no plugin component is found and children is a valid React element', () => {
        getSlotComponentSpy.mockReturnValue(undefined);
        const FallbackComponent = () => <div data-testid="fallback-component-test" />;
        render(
            createTestComponent({
                children: <FallbackComponent />,
            }),
        );

        expect(screen.getByTestId('fallback-component-test')).toBeInTheDocument();
    });

    it('does not render the fallback component when a plugin component is found', () => {
        const pluginId = 'plugin-id';
        const slotId = 'slot-id';
        const slotComponent = () => <div data-testid="slot-component-test" />;
        getSlotComponentSpy.mockReturnValue(slotComponent);

        const FallbackComponent = () => <div data-testid="fallback-component-test" />;

        render(
            createTestComponent({
                pluginIds: [pluginId],
                slotId,
                children: <FallbackComponent />,
            }),
        );

        expect(screen.getByTestId('slot-component-test')).toBeInTheDocument();
        expect(screen.queryByTestId('fallback-component-test')).not.toBeInTheDocument();
    });
});
