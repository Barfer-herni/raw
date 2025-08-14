import React from 'react';

interface BodyProps {
    content: any;
    className?: string;
}

export function Body({ content, className }: BodyProps) {
    if (!content) return null;

    // This is a simplified version. In a real implementation, you would parse and render the content
    return (
        <div className={className} dangerouslySetInnerHTML={{ __html: content }} />
    );
}
