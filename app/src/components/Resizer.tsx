import React, { useCallback, useEffect, useRef } from 'react';
import styles from './Resizer.module.css';

interface ResizerProps {
    onResize: (deltaX: number) => void;
    direction?: 'horizontal' | 'vertical';
}

export const Resizer: React.FC<ResizerProps> = ({ onResize, direction = 'vertical' }) => {
    const isDragging = useRef(false);
    const startX = useRef(0);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        isDragging.current = true;
        startX.current = e.clientX;
        e.preventDefault();
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging.current) return;

        const deltaX = e.clientX - startX.current;
        startX.current = e.clientX;
        onResize(deltaX);
    }, [onResize]);

    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
    }, []);

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    return (
        <div
            className={`${styles.resizer} ${direction === 'horizontal' ? styles.horizontal : styles.vertical}`}
            onMouseDown={handleMouseDown}
        />
    );
};
