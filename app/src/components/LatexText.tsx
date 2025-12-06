import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexTextProps {
    text: string;
}

export const LatexText: React.FC<LatexTextProps> = ({ text }) => {
    const parts = useMemo(() => {
        const result: { type: 'text' | 'inline-math' | 'display-math'; content: string }[] = [];

        // Split by $$ for display math
        const displayParts = text.split('$$');

        displayParts.forEach((part, i) => {
            if (i % 2 === 1) {
                // Odd indices are display math
                result.push({ type: 'display-math', content: part });
            } else {
                // Even indices are text (potentially containing inline math)
                const inlineParts = part.split('$');
                inlineParts.forEach((subPart, j) => {
                    if (j % 2 === 1) {
                        result.push({ type: 'inline-math', content: subPart });
                    } else {
                        if (subPart) result.push({ type: 'text', content: subPart });
                    }
                });
            }
        });

        return result;
    }, [text]);

    return (
        <span style={{ whiteSpace: 'pre-wrap', display: 'block' }}>
            {parts.map((part, index) => {
                if (part.type === 'text') {
                    return <span key={index}>{part.content}</span>;
                } else {
                    try {
                        const html = katex.renderToString(part.content, {
                            throwOnError: false,
                            displayMode: part.type === 'display-math'
                        });
                        return (
                            <span
                                key={index}
                                dangerouslySetInnerHTML={{ __html: html }}
                            />
                        );
                    } catch (e) {
                        return <span key={index} style={{ color: 'red' }}>Error rendering math</span>;
                    }
                }
            })}
        </span>
    );
};
