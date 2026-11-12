import type { Meta, StoryObj } from '@storybook/react-vite';

import { Dropdown } from '../index';
import style from '../index.css?raw';

const meta: Meta<typeof Dropdown.Group> = {
    title: 'Core/Dropdown/Dropdown.Group',
    component: Dropdown.Group,
    parameters: {
        style,
    },
};

type Story = StoryObj<typeof Dropdown.Group>;

/**
 * A vertical group of independent default dropdown triggers.
 */
export const Default: Story = {
    render: () => (
        <Dropdown.Group>
            <Dropdown.Container label="Primary">
                <Dropdown.Item>Primary settings</Dropdown.Item>
                <Dropdown.Item>Primary members</Dropdown.Item>
            </Dropdown.Container>
            <Dropdown.Container label="Secondary">
                <Dropdown.Item>Secondary settings</Dropdown.Item>
                <Dropdown.Item>Sign out</Dropdown.Item>
            </Dropdown.Container>
        </Dropdown.Group>
    ),
};

/**
 * A group can contain custom trigger elements while preserving independent menus.
 */
export const CustomTriggers: Story = {
    render: () => (
        <Dropdown.Group>
            <Dropdown.Container customTrigger={<button type="button">Primary trigger</button>}>
                <Dropdown.Item>Primary settings</Dropdown.Item>
            </Dropdown.Container>
            <Dropdown.Container customTrigger={<button type="button">Secondary trigger</button>}>
                <Dropdown.Item>Secondary settings</Dropdown.Item>
            </Dropdown.Container>
        </Dropdown.Group>
    ),
};

export default meta;
