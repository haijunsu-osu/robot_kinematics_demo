import React, { useMemo, useState } from 'react';
import { Matrix4, Vector3, Quaternion } from 'three';
import { Scene } from '../../components/Scene';
import { CoordinateFrame } from '../../components/CoordinateFrame';
import { Resizer } from '../../components/Resizer';
import { RobotControls } from './RobotControls';
import { calculateDHMatrix } from '../../utils/robotics';
import type { DHRow } from '../../utils/robotics';
import styles from '../Rotations/Rotations.module.css';

interface RobotModuleProps {
    rows: DHRow[];
    setRows: React.Dispatch<React.SetStateAction<DHRow[]>>;
    axisLength: number;
    setAxisLength: (l: number) => void;
}

interface CylinderLinkProps {
    start: Vector3;
    end: Vector3;
    color: string;
    radius: number;
}

const CylinderLink: React.FC<CylinderLinkProps> = ({ start, end, color, radius }) => {
    const diff = new Vector3().subVectors(end, start);
    const length = diff.length();

    if (length < 0.001) return null;

    const mid = new Vector3().addVectors(start, end).multiplyScalar(0.5);
    const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), diff.clone().normalize());

    return (
        <mesh position={mid} quaternion={quaternion}>
            <cylinderGeometry args={[radius, radius, length, 16]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
};

export const RobotModule: React.FC<RobotModuleProps> = ({ rows, setRows, axisLength, setAxisLength }) => {
    const [controlsWidth, setControlsWidth] = useState(350);

    // Track visibility of each frame by index. 
    // Default: only the last frame (Tool) is visible.
    // frames array has length rows.length + 1 (Base + N joints)
    // We'll use a Set for simplicity.
    const [visibleFrames, setVisibleFrames] = useState<Set<number>>(() => {
        const initial = new Set<number>();
        initial.add(rows.length); // Last frame index
        return initial;
    });

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

    const handleControlsResize = (deltaX: number) => {
        setControlsWidth(prev => Math.max(250, Math.min(600, prev - deltaX)));
    };

    const toggleFrameVisibility = (index: number) => {
        setVisibleFrames(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.scene}>
                <Scene>
                    {/* Global Frame */}
                    <CoordinateFrame
                        scale={1}
                        label="World"
                        isGlobal={true}
                    />

                    {/* Robot Frames */}
                    {frames.map((m, i) => (
                        <CoordinateFrame
                            key={i}
                            matrix={m}
                            scale={axisLength}
                            label={i === 0 ? "Base" : `J${i}`}
                            showAxes={visibleFrames.has(i) ? [true, true, true] : [false, false, true]}
                        />
                    ))}

                    {/* Links (Cylinders) */}
                    {rows.map((row, i) => {
                        const startFrame = frames[i];
                        const endFrame = frames[i + 1];

                        const startPos = new Vector3().setFromMatrixPosition(startFrame);

                        // Calculate intermediate point: startPos + d * zAxis_of_startFrame
                        const zAxis = new Vector3().setFromMatrixColumn(startFrame, 2).normalize();
                        const intermediatePos = startPos.clone().add(zAxis.clone().multiplyScalar(row.d));

                        const endPos = new Vector3().setFromMatrixPosition(endFrame);

                        return (
                            <group key={i}>
                                {/* Blue Cylinder for d (along Z axis) */}
                                <CylinderLink
                                    start={startPos}
                                    end={intermediatePos}
                                    color="#3b82f6" // Blue
                                    radius={axisLength * 0.04}
                                />
                                {/* Red Cylinder for a (along X axis) */}
                                <CylinderLink
                                    start={intermediatePos}
                                    end={endPos}
                                    color="#ef4444" // Red
                                    radius={axisLength * 0.04}
                                />
                            </group>
                        );
                    })}
                </Scene>
            </div>
            <Resizer onResize={handleControlsResize} />
            <div className={styles.controls} style={{ width: `${controlsWidth}px` }}>
                <RobotControls
                    rows={rows}
                    setRows={setRows}
                    axisLength={axisLength}
                    setAxisLength={setAxisLength}
                    visibleFrames={visibleFrames}
                    toggleFrameVisibility={toggleFrameVisibility}
                />
            </div>
        </div>
    );
};
