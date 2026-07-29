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
                'font-normal text-neutral-500 text-sm leading-normal',
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
