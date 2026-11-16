import classNames from 'classnames';

export interface IFooterInfoProps {
    /**
     * The informational text to display.
     */
    text: string;
    /**
     * Rendering mode: 'panel' (default) or 'dialog'.
     * Controls text alignment — centered in panel, left-aligned in dialog.
     */
    mode?: 'panel' | 'dialog';
}

export const FooterInfo: React.FC<IFooterInfoProps> = (props) => {
    const { text, mode = 'panel' } = props;

    return (
        <p
            className={classNames(
                'text-sm leading-normal font-normal text-neutral-500',
                {
                    'text-center': mode === 'panel',
                    'text-left': mode === 'dialog',
                },
            )}
        >
            {text}
        </p>
    );
};
