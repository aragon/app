import AragonAppLogo from '@/assets/images/aragon-app.svg';
import { Image } from '@/shared/components/image';
import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface IAragonLogoProps extends ComponentProps<'div'> {}

export const AragonLogo: React.FC<IAragonLogoProps> = (props) => {
    const { className, ...otherProps } = props;

    return (
        <div className={classNames('flex flex-row items-center gap-1', className)} {...otherProps}>
            <Image alt="Aragon logo" width={32} height={32} fill={false} src="/icon.svg" />
            <Image alt="Aragon App logo" className="w-10" fill={false} src={AragonAppLogo} />
        </div>
    );
};
