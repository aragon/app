import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { Dropdown } from '../index';
import { DropdownGroup } from './dropdownGroup';

const WrappedDropdown = ({ label }: { label: string }) => (
    <div>
        <Dropdown.Container label={label}>
            <Dropdown.Item>{`${label} item`}</Dropdown.Item>
        </Dropdown.Container>
    </div>
);

describe('<Dropdown.Group /> component', () => {
    it('keeps trigger order for direct and wrapped containers', () => {
        render(
            <DropdownGroup>
                <Dropdown.Container label="First">
                    <Dropdown.Item>First item</Dropdown.Item>
                </Dropdown.Container>
                <WrappedDropdown label="Second" />
                <Dropdown.Container label="Third">
                    <Dropdown.Item>Third item</Dropdown.Item>
                </Dropdown.Container>
            </DropdownGroup>,
        );

        expect(screen.getAllByRole('button').map((trigger) => trigger.textContent)).toEqual([
            'First',
            'Second',
            'Third',
        ]);
    });

    it('opens each child menu independently', async () => {
        const user = userEvent.setup();
        render(
            <DropdownGroup>
                <Dropdown.Container label="First">
                    <Dropdown.Item>First item</Dropdown.Item>
                </Dropdown.Container>
                <Dropdown.Container label="Second">
                    <Dropdown.Item>Second item</Dropdown.Item>
                </Dropdown.Container>
            </DropdownGroup>,
        );

        await user.click(screen.getByRole('button', { name: 'First' }));
        const firstItem = screen.getByRole('menuitem', { name: 'First item' });
        expect(firstItem).toBeInTheDocument();

        await user.click(firstItem);
        await user.click(screen.getByRole('button', { name: 'Second' }));
        expect(screen.getByRole('menuitem', { name: 'Second item' })).toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: 'First item' })).not.toBeInTheDocument();
    });

    it('preserves custom trigger elements', async () => {
        const user = userEvent.setup();
        render(
            <DropdownGroup>
                <Dropdown.Container customTrigger={<button type="button">Custom trigger</button>}>
                    <Dropdown.Item>Custom item</Dropdown.Item>
                </Dropdown.Container>
            </DropdownGroup>,
        );

        const trigger = screen.getByRole('button', { name: 'Custom trigger' });
        expect(trigger).toBeInTheDocument();

        await user.click(trigger);
        expect(screen.getByRole('menuitem', { name: 'Custom item' })).toBeInTheDocument();
    });

    it('preserves keyboard focus order across grouped triggers', async () => {
        const user = userEvent.setup();
        render(
            <DropdownGroup>
                <Dropdown.Container label="First">
                    <Dropdown.Item>First item</Dropdown.Item>
                </Dropdown.Container>
                <Dropdown.Container label="Second">
                    <Dropdown.Item>Second item</Dropdown.Item>
                </Dropdown.Container>
                <Dropdown.Container label="Third">
                    <Dropdown.Item>Third item</Dropdown.Item>
                </Dropdown.Container>
            </DropdownGroup>,
        );

        await user.tab();
        expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
        await user.tab();
        expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus();
        await user.tab();
        expect(screen.getByRole('button', { name: 'Third' })).toHaveFocus();
    });
});
