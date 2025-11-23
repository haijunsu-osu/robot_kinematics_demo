import React, { useState, useEffect } from 'react';
import { Matrix4, Euler, Quaternion, Vector3, MathUtils } from 'three';
import styles from './RotationsControls.module.css';
import { getAxisAngleFromMatrix, getMatrixFromAxisAngle } from '../../utils/robotics';

interface RotationsControlsProps {
    matrix: Matrix4;
    onChange: (newMatrix: Matrix4) => void;
}

export const RotationsControls: React.FC<RotationsControlsProps> = ({ matrix, onChange }) => {
    const [euler, setEuler] = useState(new Euler());
    const [quaternion, setQuaternion] = useState(new Quaternion());

    // Axis-Angle State
    const [axis, setAxis] = useState(new Vector3(0, 0, 1));
    const [angleDeg, setAngleDeg] = useState(0);

    useEffect(() => {
        const e = new Euler().setFromRotationMatrix(matrix);
        const q = new Quaternion().setFromRotationMatrix(matrix);
        setEuler(e);
        setQuaternion(q);

        const aa = getAxisAngleFromMatrix(matrix);
        setAxis(aa.axis);
        setAngleDeg(MathUtils.radToDeg(aa.angle));
    }, [matrix]);

    const handleEulerChange = (axis: 'x' | 'y' | 'z', value: number) => {
        const newEuler = euler.clone();
        newEuler[axis] = value;
        const newMatrix = new Matrix4().makeRotationFromEuler(newEuler);
        onChange(newMatrix);
    };

    const handleMatrixInput = (index: number, value: string) => {
        const val = parseFloat(value);
        if (isNaN(val)) return;
        const newMatrix = matrix.clone();
        newMatrix.elements[index] = val;
        onChange(newMatrix);
    };

    const handleAxisAngleChange = (field: 'x' | 'y' | 'z' | 'angle', value: number) => {
        let newAxis = axis.clone();
        let newAngle = angleDeg;

        if (field === 'angle') {
            newAngle = value;
        } else {
            newAxis[field] = value;
        }

        // Update local state immediately for responsiveness
        if (field === 'angle') setAngleDeg(value);
        else setAxis(newAxis);

        // Compute new matrix
        // Avoid zero vector for axis
        if (newAxis.lengthSq() > 0.0001) {
            const m = getMatrixFromAxisAngle(newAxis, MathUtils.degToRad(newAngle));
            onChange(m);
        }
    };

    return (
        <div className={styles.wrapper}>
            <section>
                <h3>Euler Angles (Rad)</h3>
                <div className={styles.sliderGroup}>
                    <label>X: {euler.x.toFixed(2)}</label>
                    <input
                        type="range" min={-Math.PI} max={Math.PI} step={0.01}
                        value={euler.x} onChange={(e) => handleEulerChange('x', parseFloat(e.target.value))}
                    />
                </div>
                <div className={styles.sliderGroup}>
                    <label>Y: {euler.y.toFixed(2)}</label>
                    <input
                        type="range" min={-Math.PI} max={Math.PI} step={0.01}
                        value={euler.y} onChange={(e) => handleEulerChange('y', parseFloat(e.target.value))}
                    />
                </div>
                <div className={styles.sliderGroup}>
                    <label>Z: {euler.z.toFixed(2)}</label>
                    <input
                        type="range" min={-Math.PI} max={Math.PI} step={0.01}
                        value={euler.z} onChange={(e) => handleEulerChange('z', parseFloat(e.target.value))}
                    />
                </div>
            </section>

            <section>
                <h3>Axis-Angle</h3>
                <div className={styles.inputGroup}>
                    <label>Angle (°)</label>
                    <input
                        type="number" step="1" value={angleDeg.toFixed(1)}
                        onChange={(e) => handleAxisAngleChange('angle', parseFloat(e.target.value))}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label>Axis X</label>
                    <input
                        type="number" step="0.1" value={axis.x.toFixed(2)}
                        onChange={(e) => handleAxisAngleChange('x', parseFloat(e.target.value))}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label>Axis Y</label>
                    <input
                        type="number" step="0.1" value={axis.y.toFixed(2)}
                        onChange={(e) => handleAxisAngleChange('y', parseFloat(e.target.value))}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label>Axis Z</label>
                    <input
                        type="number" step="0.1" value={axis.z.toFixed(2)}
                        onChange={(e) => handleAxisAngleChange('z', parseFloat(e.target.value))}
                    />
                </div>
            </section>

            <section>
                <h3>Rotation Matrix (3x3)</h3>
                <div className={styles.matrixGrid}>
                    {[0, 4, 8, 1, 5, 9, 2, 6, 10].map((idx) => (
                        <input
                            key={idx}
                            type="number"
                            step="0.1"
                            value={matrix.elements[idx].toFixed(2)}
                            onChange={(e) => handleMatrixInput(idx, e.target.value)}
                            className={styles.matrixInput}
                        />
                    ))}
                </div>
            </section>

            <section>
                <h3>Quaternion</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <div>x: {quaternion.x.toFixed(3)}</div>
                    <div>y: {quaternion.y.toFixed(3)}</div>
                    <div>z: {quaternion.z.toFixed(3)}</div>
                    <div>w: {quaternion.w.toFixed(3)}</div>
                </div>
            </section>
        </div>
    );
};
