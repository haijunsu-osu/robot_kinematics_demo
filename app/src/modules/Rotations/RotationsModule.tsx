import React, { useMemo } from 'react';
import { Matrix4, Quaternion, Vector3 } from 'three';
import { Scene } from '../../components/Scene';
import { CoordinateFrame } from '../../components/CoordinateFrame';
import { RotationsControls } from './RotationsControls';
import styles from './Rotations.module.css';

interface RotationsModuleProps {
    matrix: Matrix4;
    setMatrix: (m: Matrix4) => void;
}

const RotationAxisVisualizer: React.FC<{ matrix: Matrix4 }> = ({ matrix }) => {
    const { axis, angle } = useMemo(() => {
        const q = new Quaternion().setFromRotationMatrix(matrix);
        // Clamp w to [-1, 1] to avoid NaN
        const w = Math.min(Math.max(q.w, -1), 1);
        const angle = 2 * Math.acos(w);
        const s = Math.sqrt(1 - w * w);
        if (s < 0.001) return { axis: new Vector3(0, 0, 1), angle: 0 };
        const axis = new Vector3(q.x, q.y, q.z).divideScalar(s);
        return { axis, angle };
    }, [matrix]);

    if (angle < 0.001) return null;

    return (
        <group>
            <arrowHelper args={[axis, new Vector3(0, 0, 0), 2, 0xffff00]} />
        </group>
    );
};

export const RotationsModule: React.FC<RotationsModuleProps> = ({ matrix, setMatrix }) => {
    const handleMatrixChange = (newMatrix: Matrix4) => {
        setMatrix(newMatrix.clone());
    };

    return (
        <div className={styles.container}>
            <div className={styles.scene}>
                <Scene>
                    <CoordinateFrame matrix={matrix} />
                    <RotationAxisVisualizer matrix={matrix} />
                </Scene>
            </div>
            <div className={styles.controls}>
                <RotationsControls matrix={matrix} onChange={handleMatrixChange} />
            </div>
        </div>
    );
};
