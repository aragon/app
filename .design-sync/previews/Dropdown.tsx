import { Dropdown, IconType } from '@aragon/gov-ui-kit';

export const OpenMenu = () => (
    <div className="flex h-72 w-full items-start">
        <Dropdown.Container defaultOpen={true} label="Proposal actions" size="md">
            <Dropdown.Item icon={IconType.PLUS} iconPosition="left">
                Create proposal
            </Dropdown.Item>
            <Dropdown.Item icon={IconType.COPY} iconPosition="left">
                Duplicate proposal
            </Dropdown.Item>
            <Dropdown.Item selected={true}>Sort by newest</Dropdown.Item>
            <Dropdown.Item disabled={true} icon={IconType.SETTINGS} iconPosition="left">
                Edit settings
            </Dropdown.Item>
        </Dropdown.Container>
    </div>
);

export const ClosedTriggers = () => (
    <div className="flex items-center gap-4">
        <Dropdown.Container label="Filter proposals" size="md" />
        <Dropdown.Container size="md" />
        <Dropdown.Container disabled={true} label="Disabled" size="md" />
    </div>
);
