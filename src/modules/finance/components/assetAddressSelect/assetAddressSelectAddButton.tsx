import { Icon, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ComponentProps } from 'react';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IAssetAddressSelectAddButtonProps
    extends ComponentProps<'button'> {}

export const AssetAddressSelectAddButton: React.FC<
    IAssetAddressSelectAddButtonProps
> = (props) => {
    const { className, type = 'button', ...otherProps } = props;

    const { t } = useTranslations();

    return (
        <button
            className={classNames(
                'group flex w-full cursor-pointer items-center gap-3 rounded-xl bg-transparent px-4 py-3 text-base text-primary-400 leading-tight transition-colors',
                // Default bg is transparent; hover/focus use primary-400 @ 4%, active @ 8%
                'focus-ring-primary hover:bg-primary-400/4 active:bg-primary-400/8',
                'md:gap-4 md:px-6 md:py-5 md:text-lg',
                className,
            )}
            type={type}
            {...otherProps}
        >
            <span
                className={classNames(
                    'flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-50 transition-colors md:size-8',
                    // Avatar swaps to white when the button itself has a state bg
                    'group-hover:bg-neutral-0 group-focus-visible:bg-neutral-0 group-active:bg-neutral-0',
                )}
            >
                <Icon
                    className="size-3 text-primary-400 md:size-4"
                    icon={IconType.PLUS}
                />
            </span>
            <span className="flex-1 truncate text-left">
                {t('app.finance.assetAddressSelect.addButton.label')}
            </span>
        </button>
    );
};
