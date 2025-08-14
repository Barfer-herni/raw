import React from 'react';

interface CodeBlockProps {
    code: string;
    language?: string;
    fileName?: string;
    className?: string;
}

export function CodeBlock({ code, language, fileName, className }: CodeBlockProps) {
    return (
        <div className={className}>
            {fileName && <div className="text-sm text-gray-500 mb-1">{fileName}</div>}
            <pre className={`language-${language || 'text'} p-4 rounded bg-gray-900 text-white overflow-auto`}>
                <code>{code}</code>
            </pre>
        </div>
    );
}
