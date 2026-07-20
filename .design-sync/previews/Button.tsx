import { Button, IconType } from '@aragon/gov-ui-kit';

export const Default = () => <Button variant="primary">Button label</Button>;

export const Variants = () => (
    <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="tertiary">Tertiary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="success">Success</Button>
        <Button variant="warning">Warning</Button>
        <Button variant="critical">Critical</Button>
    </div>
);

export const Sizes = () => (
    <div className="flex items-center gap-3">
        <Button size="lg">Large</Button>
        <Button size="md">Medium</Button>
        <Button size="sm">Small</Button>
    </div>
);

export const WithIcons = () => (
    <div className="flex items-center gap-3">
        <Button iconLeft={IconType.PLUS}>Create proposal</Button>
        <Button iconRight={IconType.LINK_EXTERNAL} variant="secondary">
            View on explorer
        </Button>
        <Button iconLeft={IconType.PLUS} variant="tertiary" />
    </div>
);

export const States = () => (
    <div className="flex items-center gap-3">
        <Button disabled={true}>Disabled</Button>
        <Button isLoading={true}>Loading</Button>
        <Button href="https://aragon.org" target="_blank" variant="secondary">
            Link button
        </Button>
    </div>
);
