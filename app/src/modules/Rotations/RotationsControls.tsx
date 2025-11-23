import React, { useState, useEffect } from 'react';
import { Matrix4, Euler, Quaternion, Vector3, MathUtils } from 'three';
import styles from './RotationsControls.module.css';
import {
    getAxisAngleFromMatrix,
    getMatrixFromAxisAngle,
    getScrewParametersFromMatrix,
    type ScrewParameters
} from '../../utils/robotics';

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

    const [inputText, setInputText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [screwParams, setScrewParams] = useState<ScrewParameters | null>(null);

    useEffect(() => {
        const e = new Euler().setFromRotationMatrix(matrix);
        const q = new Quaternion().setFromRotationMatrix(matrix);
        setEuler(e);
        setQuaternion(q);

        const aa = getAxisAngleFromMatrix(matrix);
        setAxis(aa.axis);
        setAngleDeg(MathUtils.radToDeg(aa.angle));

        // Clear screw params when matrix changes externally to avoid stale data
        // or we could auto-compute it. Let's clear it to require explicit "Compute" action as requested
        // or maybe auto-compute if we want it live. 
        // User asked for a button, so let's keep it manual or update it if we want.
        // Let's clear it so the manual input section is distinct.
        setScrewParams(null);
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

    const handleParseAndCompute = () => {
        setError(null);
        // Split by comma, space, tab, colon, newline
        // Filter out empty strings
        const tokens = inputText.trim().split(/[\s,;:\t\n{}]+/).filter(t => t.length > 0);
        const numbers = tokens.map(t => parseFloat(t));

        if (numbers.some(isNaN)) {
            setError("Invalid numbers detected");
            return;
        }

        if (numbers.length !== 9) {
            setError(`Expected 9 numbers, found ${numbers.length}`);
            return;
        }

        // Create matrix (row-major input to set())
        const m = new Matrix4();
        m.set(
            numbers[0], numbers[1], numbers[2], 0,
            numbers[3], numbers[4], numbers[5], 0,
            numbers[6], numbers[7], numbers[8], 0,
            0, 0, 0, 1
        );

        onChange(m);

        // Compute screw params
        const params = getScrewParametersFromMatrix(m);
        setScrewParams(params);
    };

    const [copyFeedback, setCopyFeedback] = useState(false);

    const handleCopyMatrix = () => {
        const e = matrix.elements;
        // Format: m00 m01 m02; m10 m11 m12; m20 m21 m22
        // Three.js is column-major: 0,1,2,3 are col 0. 4,5,6,7 are col 1.
        const row1 = `${e[0].toFixed(4)} ${e[4].toFixed(4)} ${e[8].toFixed(4)}`;
        const row2 = `${e[1].toFixed(4)} ${e[5].toFixed(4)} ${e[9].toFixed(4)}`;
        const row3 = `${e[2].toFixed(4)} ${e[6].toFixed(4)} ${e[10].toFixed(4)}`;
        const text = `${row1}; ${row2}; ${row3}`;

        navigator.clipboard.writeText(text).then(() => {
            setCopyFeedback(true);
            setTimeout(() => setCopyFeedback(false), 2000);
        });
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, border: 'none', padding: 0 }}>Rotation Matrix (3x3)</h3>
                    <button
                        className={styles.button}
                        style={{ width: 'auto', padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={handleCopyMatrix}
                    >
                        {copyFeedback ? "Copied!" : "Copy"}
                    </button>
                </div>
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

            <section>
                <h3>Matrix Input & Analysis</h3>
                <textarea
                    className={styles.textarea}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste 3x3 matrix here (space, comma, tab, or colon separated)"
                />
                <button className={styles.button} onClick={handleParseAndCompute}>
                    Parse & Compute
                </button>
                {error && <div style={{ color: 'var(--error-color, #ff4444)', marginTop: '0.5rem', fontSize: '0.9rem' }}>{error}</div>}

                {screwParams && (
                    <div className={styles.screwParams} style={{ marginTop: '1rem' }}>
                        <span className={styles.screwLabel}>Axis:</span>
                        <span className={styles.screwValue}>
                            [{screwParams.s.x.toFixed(3)}, {screwParams.s.y.toFixed(3)}, {screwParams.s.z.toFixed(3)}]
                        </span>

                        <span className={styles.screwLabel}>Angle:</span>
                        <span className={styles.screwValue}>
                            {(screwParams.theta * 180 / Math.PI).toFixed(2)}°
                        </span>

                        <span className={styles.screwLabel}>Displacement:</span>
                        <span className={styles.screwValue}>
                            {screwParams.d.toFixed(3)}
                        </span>

                        <span className={styles.screwLabel}>Point on Axis:</span>
                        <span className={styles.screwValue}>
                            [{screwParams.c.x.toFixed(3)}, {screwParams.c.y.toFixed(3)}, {screwParams.c.z.toFixed(3)}]
                        </span>
                    </div>
                )}
            </section>
        </div>
    );
};
