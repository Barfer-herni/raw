import React from 'react';

interface FeedProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    className?: string;
}

export function Feed<T>({ items, renderItem, className }: FeedProps<T>) {
    if (!items || items.length === 0) return null;

    return (
        <div className={className}>
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {renderItem(item, index)}
                </React.Fragment>
            ))}
        </div>
    );
}
