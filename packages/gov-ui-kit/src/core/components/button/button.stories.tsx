import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconType } from '../icon';
import { Button } from './button';

const meta: Meta<typeof Button> = {
    title: 'Core/Button',
    component: Button,
    argTypes: {
        href: { control: 'text' },
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/jfKRr1V9evJUp1uBeyP3Zz/v1.0.0?node-id=7980-15610&t=RVJHJFTrLMnhgYnJ-4',
        },
    },
};

type Story = StoryObj<typeof Button>;

/**
 * Default usage example of the Button component.
 */
export const Default: Story = {
    args: {
        children: 'Button label',
    },
};

/**
 * Set the `iconLeft` property when rendering only an icon inside the Button component.
 */
export const OnlyIcon: Story = {
    args: {
        iconLeft: IconType.PLUS,
    },
};

/**
 * The Button component renders a <a /> tag when the href property is set.
 */
export const Link: Story = {
    args: {
        children: 'Link label',
        href: 'https://www.google.com',
        target: '_blank',
    },
};

/**
 * Button component with a size that changes depending on the current breakpoint.
 */
export const ResponsiveButton: Story = {
    args: {
        size: 'md',
        responsiveSize: { xl: 'lg' },
        children: 'Responsive button',
    },
};

const variants = ['primary', 'secondary', 'tertiary', 'ghost', 'success', 'warning', 'critical'] as const;

/**
 * Every variant in its default, icon, only-icon, loading and disabled forms. Use the theme switcher in the toolbar to
 * compare the colour themes.
 */
export const Variants: Story = {
    render: (props) => (
        <div className="flex flex-col gap-3">
            {variants.map((variant) => (
                <div className="flex flex-row items-center gap-3" data-variant={variant} key={variant}>
                    <Button {...props} variant={variant}>
                        Button
                    </Button>
                    <Button {...props} iconLeft={IconType.PLUS} iconRight={IconType.CHEVRON_DOWN} variant={variant}>
                        With icons
                    </Button>
                    <Button {...props} iconLeft={IconType.PLUS} variant={variant} />
                    <Button {...props} isLoading={true} variant={variant}>
                        Loading
                    </Button>
                    <Button {...props} disabled={true} iconLeft={IconType.PLUS} variant={variant}>
                        Disabled
                    </Button>
                </div>
            ))}
        </div>
    ),
};

export default meta;
