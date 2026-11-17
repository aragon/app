import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface IKeyboardShortcutProps extends ComponentProps<'div'> {}

export const KeyboardShortcut: React.FC<IKeyboardShortcutProps> = (props) => {
    const { className, children, ...otherProps } = props;

    const containerClassName = classNames(
        'bg-neutral-0 flex h-[18px] w-5 items-center justify-center rounded-md border border-neutral-100',
        'text-xs leading-tight font-normal text-neutral-800',
        className,
    );

    return (
        <div className={containerClassName} {...otherProps}>
            {children}
        </div>
    );
};
