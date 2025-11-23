import React, { useMemo } from 'react';
import { Matrix4, Quaternion, Vector3 } from 'three';
import { Scene } from '../../components/Scene';
import { CoordinateFrame } from '../../components/CoordinateFrame';
import { TransformationsControls } from './TransformationsControls';
import styles from '../Rotations/Rotations.module.css';

interface TransformationsModuleProps {
    matrix: Matrix4;
    setMatrix: (m: Matrix4) => void;
}

const TransformationVisualizer: React.FC<{ matrix: Matrix4 }> = ({ matrix }) => {
    const { axis, angle, position } = useMemo(() => {
        const q = new Quaternion().setFromRotationMatrix(matrix);
        const w = Math.min(Math.max(q.w, -1), 1);
        const angle = 2 * Math.acos(w);
        const s = Math.sqrt(1 - w * w);
        const axis = s < 0.001 ? new Vector3(0, 0, 1) : new Vector3(q.x, q.y, q.z).divideScalar(s);
        const position = new Vector3().setFromMatrixPosition(matrix);
        return { axis, angle, position };
    }, [matrix]);

    return (
        <group>
            {/* Rotation Axis (Yellow) at Origin */}
            {angle > 0.001 && (
                <arrowHelper args={[axis, new Vector3(0, 0, 0), 2, 0xffff00]} />
            )}

            {/* Translation Vector (Cyan) from Origin to Position */}
            {position.length() > 0.001 && (
                <arrowHelper args={[position.clone().normalize(), new Vector3(0, 0, 0), position.length(), 0x00ffff]} />
            )}
        </group>
    );
};

export const TransformationsModule: React.FC<TransformationsModuleProps> = ({ matrix, setMatrix }) => {
    const handleMatrixChange = (newMatrix: Matrix4) => {
        setMatrix(newMatrix.clone());
    };

    return (
        <div className={styles.container}>
            <div className={styles.scene}>
                <Scene>
                    {/* Fixed World Frame is already in Scene */}
                    {/* Moving Frame */}
                    <CoordinateFrame matrix={matrix} label="Moving" />
                    <TransformationVisualizer matrix={matrix} />
                </Scene>
            </div>
            <div className={styles.controls}>
                <TransformationsControls matrix={matrix} onChange={handleMatrixChange} />
            </div>
        </div>
    );
};
