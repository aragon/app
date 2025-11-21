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

export const XmaquinaActionImage: React.FC<IXmaquinaActionImageProps> = (props) => {
    const { icon, alt } = props;

    return (
        <Image
            src={icon}
            alt={alt}
            width={96}
            height={96}
            className="relative z-10 shrink-0 transition-[filter] duration-500 group-hover:brightness-0"
        />
    );
};
