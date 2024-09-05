import { render, screen } from '@testing-library/react';
import { type IKeyboardShortcutProps, KeyboardShortcut } from './keyboardShortcut';

describe('<KeyboardShortcut /> component', () => {
    const createTestComponent = (props?: Partial<IKeyboardShortcutProps>) => {
        const completeProps: IKeyboardShortcutProps = { ...props };

        return <KeyboardShortcut {...completeProps} />;
    };

    it('renders the children component', () => {
        const children = '↓';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });
});
