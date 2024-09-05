import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface IKeyboardShortcutProps extends ComponentProps<'div'> {}

export const KeyboardShortcut: React.FC<IKeyboardShortcutProps> = (props) => {
    const { className, children, ...otherProps } = props;

    const containerClassName = classNames(
        'flex h-[18px] w-5 items-center justify-center rounded border border-neutral-100 bg-neutral-0',
        'text-xs font-normal leading-tight text-neutral-800',
        className,
    );

    return (
        <div className={containerClassName} {...otherProps}>
            {children}
        </div>
    );
};
