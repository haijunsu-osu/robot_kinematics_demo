import React, { useMemo, useState } from 'react';
import { Matrix4, Vector3 } from 'three';
import { Scene } from '../../components/Scene';
import { CoordinateFrame } from '../../components/CoordinateFrame';
import { Resizer } from '../../components/Resizer';
import { RobotControls } from './RobotControls';
import { calculateDHMatrix } from '../../utils/robotics';
import type { DHRow } from '../../utils/robotics';
import styles from '../Rotations/Rotations.module.css';
import { Line } from '@react-three/drei';

interface RobotModuleProps {
    rows: DHRow[];
    setRows: React.Dispatch<React.SetStateAction<DHRow[]>>;
    axisLength: number;
    setAxisLength: (l: number) => void;
}

export const RobotModule: React.FC<RobotModuleProps> = ({ rows, setRows, axisLength, setAxisLength }) => {
    const [controlsWidth, setControlsWidth] = useState(350);

    const frames = useMemo(() => {
        const f: Matrix4[] = [];
        let current = new Matrix4();
        f.push(current.clone()); // Base frame

        rows.forEach(row => {
            const transform = calculateDHMatrix(row.a, row.alpha, row.d, row.theta);
            current = current.clone().multiply(transform);
            f.push(current.clone());
        });
        return f;
    }, [rows]);

    const points = useMemo(() => {
        return frames.map(m => new Vector3().setFromMatrixPosition(m));
    }, [frames]);

    const handleControlsResize = (deltaX: number) => {
        setControlsWidth(prev => Math.max(250, Math.min(600, prev - deltaX)));
    };

    return (
        <div className={styles.container}>
            <div className={styles.scene}>
                <Scene>
                    {/* Frames */}
                    {frames.map((m, i) => (
                        <CoordinateFrame
                            key={i}
                            matrix={m}
                            scale={axisLength}
                            label={i === 0 ? "Base" : `J${i}`}
                        />
                    ))}

                    {/* Links (Lines connecting origins) */}
                    <Line
                        points={points}
                        color="white"
                        lineWidth={3}
                    />
                </Scene>
            </div>
            <Resizer onResize={handleControlsResize} />
            <div className={styles.controls} style={{ width: `${controlsWidth}px` }}>
                <RobotControls
                    rows={rows}
                    setRows={setRows}
                    axisLength={axisLength}
                    setAxisLength={setAxisLength}
                />
            </div>
        </div>
    );
};
