import { Icon, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ComponentProps } from 'react';

export const BoundlessAvatarIcon: React.FC<ComponentProps<'div'>> = (props) => {
    const { className, ...rest } = props;

    return (
        <div
            className={classNames(
                'inline-flex max-w-fit items-center justify-center rounded-full bg-gradient-to-r from-[#C9C9C9] via-[#C9C9C9] to-[#FFFFFF] p-[1px]',
                className,
            )}
            {...rest}
        >
            <div className="flex size-8 items-center justify-center rounded-full bg-[#EFEEE7] backdrop-blur-sm">
                <Icon icon={IconType.LINK_EXTERNAL} size="md" className="text-[#537263]" />
            </div>
        </div>
    );
};
