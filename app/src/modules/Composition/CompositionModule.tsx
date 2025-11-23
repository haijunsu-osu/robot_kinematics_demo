import React, { useMemo } from 'react';
import { Matrix4 } from 'three';
import { Scene } from '../../components/Scene';
import { CoordinateFrame } from '../../components/CoordinateFrame';
import { CompositionControls } from './CompositionControls';
import styles from '../Rotations/Rotations.module.css';

export interface TransformStep {
    id: string;
    name: string;
    matrix: Matrix4;
    active: boolean;
}

interface CompositionModuleProps {
    steps: TransformStep[];
    setSteps: React.Dispatch<React.SetStateAction<TransformStep[]>>;
    mode: 'intrinsic' | 'extrinsic';
    setMode: (mode: 'intrinsic' | 'extrinsic') => void;
}

export const CompositionModule: React.FC<CompositionModuleProps> = ({ steps, setSteps, mode, setMode }) => {
    // Calculate final matrix
    const finalMatrix = useMemo(() => {
        const result = new Matrix4(); // Identity

        if (mode === 'intrinsic') {
            steps.forEach(step => {
                if (step.active) result.multiply(step.matrix);
            });
        } else {
            steps.forEach(step => {
                if (step.active) result.premultiply(step.matrix);
            });
        }

        return result;
    }, [steps, mode]);

    // Calculate intermediate frames for visualization
    const intermediateFrames = useMemo(() => {
        const frames: Matrix4[] = [];
        let current = new Matrix4();
        frames.push(current.clone()); // Start at Identity

        if (mode === 'intrinsic') {
            steps.forEach(step => {
                if (step.active) {
                    current = current.clone().multiply(step.matrix);
                    frames.push(current.clone());
                }
            });
        } else {
            steps.forEach(step => {
                if (step.active) {
                    current = current.clone().premultiply(step.matrix);
                    frames.push(current.clone());
                }
            });
        }
        return frames;
    }, [steps, mode]);

    return (
        <div className={styles.container}>
            <div className={styles.scene}>
                <Scene>
                    {/* Show intermediate frames as ghosts? */}
                    {intermediateFrames.map((m, i) => (
                        <CoordinateFrame
                            key={i}
                            matrix={m}
                            scale={i === intermediateFrames.length - 1 ? 1 : 0.5} // Smaller ghosts
                            label={i === intermediateFrames.length - 1 ? "Final" : undefined}
                        />
                    ))}
                </Scene>
            </div>
            <div className={styles.controls}>
                <CompositionControls
                    steps={steps}
                    setSteps={setSteps}
                    mode={mode}
                    setMode={setMode}
                    finalMatrix={finalMatrix}
                />
            </div>
        </div>
    );
};
