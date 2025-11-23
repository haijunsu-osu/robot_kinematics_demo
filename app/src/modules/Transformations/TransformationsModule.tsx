import React, { useMemo } from 'react';
import { Matrix4, Vector3 } from 'three';
import { Scene } from '../../components/Scene';
import { CoordinateFrame } from '../../components/CoordinateFrame';
import { TransformationsControls } from './TransformationsControls';
import styles from '../Rotations/Rotations.module.css';

interface TransformationsModuleProps {
    matrix: Matrix4;
    setMatrix: (m: Matrix4) => void;
}

import { getScrewParametersFromMatrix } from '../../utils/robotics';

const TransformationVisualizer: React.FC<{ matrix: Matrix4 }> = ({ matrix }) => {
    const { screw, position } = useMemo(() => {
        const screw = getScrewParametersFromMatrix(matrix);
        const position = new Vector3().setFromMatrixPosition(matrix);
        return { screw, position };
    }, [matrix]);

    return (
        <group>
            {/* Screw Axis (Yellow) at Point C */}
            {screw.s.lengthSq() > 0.001 && (
                <group>
                    {/* Show axis line passing through C. We draw a long line. */}
                    <arrowHelper args={[screw.s, screw.c, 3, 0xffff00]} />
                    <arrowHelper args={[screw.s.clone().negate(), screw.c, 3, 0xffff00]} />
                    {/* Show Point C */}
                    <mesh position={screw.c}>
                        <sphereGeometry args={[0.05]} />
                        <meshBasicMaterial color="yellow" />
                    </mesh>
                </group>
            )}

            {/* Translation Vector (Cyan) from Origin to Position (optional, but good for context) */}
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
