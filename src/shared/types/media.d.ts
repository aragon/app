declare module '*.svg' {
    // Use `any` to avoid conflicts with `@svgr/webpack` or `babel-plugin-inline-react-svg`
    // biome-ignore lint/suspicious/noExplicitAny: matches Next.js image-types/global.d.ts
    const content: any;
    export default content;
}

declare module '*.png' {
    const content: import('next/image').StaticImageData;
    export default content;
}

declare module '*.jpg' {
    const content: import('next/image').StaticImageData;
    export default content;
}

declare module '*.jpeg' {
    const content: import('next/image').StaticImageData;
    export default content;
}

declare module '*.gif' {
    const content: import('next/image').StaticImageData;
    export default content;
}

declare module '*.webp' {
    const content: import('next/image').StaticImageData;
    export default content;
}

declare module '*.ico' {
    const content: import('next/image').StaticImageData;
    export default content;
}

declare module '*.bmp' {
    const content: import('next/image').StaticImageData;
    export default content;
}

declare module '*.avif' {
    const content: import('next/image').StaticImageData;
    export default content;
}
