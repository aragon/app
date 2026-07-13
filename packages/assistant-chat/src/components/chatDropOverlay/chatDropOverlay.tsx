export interface IChatDropOverlayProps {
    /**
     * Whether files are currently dragged over the panel.
     */
    isVisible: boolean;
}

export const ChatDropOverlay: React.FC<IChatDropOverlayProps> = (props) => {
    const { isVisible } = props;

    if (!isVisible) {
        return null;
    }

    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-none bg-neutral-0/90 p-6">
            <div className="flex h-full w-full items-center justify-center rounded-xl border-2 border-primary-400 border-dashed">
                <p className="text-neutral-800 text-sm">Drop files to attach</p>
            </div>
        </div>
    );
};
