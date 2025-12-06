type ImageSource = {
    src: string;
    width: number;
    height: number;
};

type PicturePayload = {
    img: ImageSource;
    sources: Record<string, ImageSource[]>;
};

declare module '@/images/*?*as=picture*' {
    const picture: PicturePayload;
    export default picture;
}

declare module '@/images/*?*as=srcset*' {
    const srcSet: string;
    export default srcSet;
}

declare module '@/images/*?*' {
    const src: string;
    export default src;
}

declare module '*?imagetools*&as=picture*' {
    const picture: PicturePayload;
    export default picture;
}

declare module '*?imagetools*&as=srcset*' {
    const srcSet: string;
    export default srcSet;
}

declare module '*?imagetools*' {
    const src: string;
    export default src;
}
