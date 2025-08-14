import React from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
  items?: TocItem[];
}

interface TableOfContentsProps {
  items?: TocItem[];
  className?: string;
}

export function TableOfContents({ items, className }: TableOfContentsProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className={className}>
      <nav>
        <ol className="flex list-none flex-col gap-2 text-sm">
          {items.map((item) => (
            <TocItem key={item.id} item={item} />
          ))}
        </ol>
      </nav>
    </div>
  );
}

interface TocItemProps {
  item: TocItem;
}

function TocItem({ item }: TocItemProps) {
  return (
    <li className="pl-3" style={{ marginLeft: `${(item.level - 1) * 16}px` }}>
      <a
        className="line-clamp-3 flex rounded-sm text-foreground text-sm underline decoration-foreground/0 transition-colors hover:decoration-foreground/50"
        href={`#${item.id}`}
      >
        {item.text}
      </a>
      {item.items && item.items.length > 0 && (
        <ol className="flex list-none flex-col gap-2 text-sm mt-2">
          {item.items.map((subItem) => (
            <TocItem key={subItem.id} item={subItem} />
          ))}
        </ol>
      )}
    </li>
  );
}
