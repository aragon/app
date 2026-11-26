import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface IKeyboardShortcutProps extends ComponentProps<'div'> {}

export const KeyboardShortcut: React.FC<IKeyboardShortcutProps> = (props) => {
    const { className, children, ...otherProps } = props;

    const containerClassName = classNames(
        'flex h-[18px] w-5 items-center justify-center rounded-md border border-surface-secondary bg-surface-primary',
        'type-caption--input-hint text-surface-primary',
        className,
    );

    return (
        <div className={containerClassName} {...otherProps}>
            {children}
        </div>
    );
};
