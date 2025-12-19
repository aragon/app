import Image from 'next/image';

export interface IXmaquinaActionImageProps {
    /**
     * The SVG icon to be displayed.
     */
    icon: string;
    /**
     * The alternative text for the icon.
     */
    alt: string;
    /**
     * Whether the parent action item is hovered.
     */
    isHovered?: boolean;
}

export const XmaquinaActionImage: React.FC<IXmaquinaActionImageProps> = (
    props,
) => {
    const { icon, alt } = props;

    return (
        <Image
            alt={alt}
            className="relative z-10 size-20 shrink-0 transition-[filter] duration-500 group-hover:brightness-0 md:size-24"
            sizes="(min-width: 768px) 96px, 72px"
            src={icon}
        />
    );
};
