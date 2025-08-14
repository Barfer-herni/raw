import NextImage from 'next/image';
import React from 'react';

interface ImageProps {
    url: string;
    width?: number;
    height?: number;
    alt?: string;
    blurDataURL?: string;
    className?: string;
}

export function Image({
    url,
    width = 800,
    height = 600,
    alt = '',
    blurDataURL,
    className,
}: ImageProps) {
    if (!url) return null;

    return (
        <NextImage
            src={url}
            width={width}
            height={height}
            alt={alt}
            className={className}
            placeholder={blurDataURL ? 'blur' : undefined}
            blurDataURL={blurDataURL}
        />
    );
}
