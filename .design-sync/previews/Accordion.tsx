import { Accordion } from '@aragon/gov-ui-kit';

export const Default = () => (
    <Accordion.Container isMulti={false} defaultValue="item-0" className="w-full">
        <Accordion.Item value="item-0">
            <Accordion.ItemHeader>Voting settings</Accordion.ItemHeader>
            <Accordion.ItemContent>
                <p className="text-neutral-500">
                    Proposals pass when the support threshold and minimum participation are both met.
                </p>
            </Accordion.ItemContent>
        </Accordion.Item>
        <Accordion.Item value="item-1">
            <Accordion.ItemHeader>Governance token</Accordion.ItemHeader>
            <Accordion.ItemContent>
                <p className="text-neutral-500">One token equals one vote.</p>
            </Accordion.ItemContent>
        </Accordion.Item>
    </Accordion.Container>
);

export const MultiOpen = () => (
    <Accordion.Container isMulti={true} defaultValue={['item-0', 'item-1']} className="w-full">
        <Accordion.Item value="item-0">
            <Accordion.ItemHeader>Members</Accordion.ItemHeader>
            <Accordion.ItemContent>
                <p className="text-neutral-500">12 members can create proposals.</p>
            </Accordion.ItemContent>
        </Accordion.Item>
        <Accordion.Item value="item-1">
            <Accordion.ItemHeader>Treasury</Accordion.ItemHeader>
            <Accordion.ItemContent>
                <p className="text-neutral-500">3 assets held by the DAO.</p>
            </Accordion.ItemContent>
        </Accordion.Item>
    </Accordion.Container>
);

export const DisabledItem = () => (
    <Accordion.Container isMulti={true} className="w-full">
        <Accordion.Item value="item-0">
            <Accordion.ItemHeader>Available section</Accordion.ItemHeader>
            <Accordion.ItemContent>
                <p className="text-neutral-500">This section can be expanded.</p>
            </Accordion.ItemContent>
        </Accordion.Item>
        <Accordion.Item disabled={true} value="item-1">
            <Accordion.ItemHeader>Locked section</Accordion.ItemHeader>
        </Accordion.Item>
    </Accordion.Container>
);
