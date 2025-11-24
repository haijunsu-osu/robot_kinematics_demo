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

    // Manual input states for Euler angles (in degrees)
    const [eulerXInput, setEulerXInput] = useState('0.0');
    const [eulerYInput, setEulerYInput] = useState('0.0');
    const [eulerZInput, setEulerZInput] = useState('0.0');

    // Manual input states for Axis-Angle
    const [angleInput, setAngleInput] = useState('0.0');
    const [axisXInput, setAxisXInput] = useState('0.00');
    const [axisYInput, setAxisYInput] = useState('0.00');
    const [axisZInput, setAxisZInput] = useState('1.00');

    const [inputText, setInputText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [screwParams, setScrewParams] = useState<ScrewParameters | null>(null);

    useEffect(() => {
        const e = new Euler().setFromRotationMatrix(matrix);
        const q = new Quaternion().setFromRotationMatrix(matrix);
        setEuler(e);
        setQuaternion(q);

        const aa = getAxisAngleFromMatrix(matrix);

        // Update input fields only if they differ significantly from current state
        // This prevents overwriting user input while typing (e.g. "1." vs "1.0")
        const updateIfChanged = (current: string, newVal: number, setter: (v: string) => void) => {
            const currentNum = parseFloat(current);
            if (isNaN(currentNum) || Math.abs(currentNum - newVal) > 0.01) {
                setter(newVal.toFixed(1));
            }
        };

        updateIfChanged(eulerXInput, MathUtils.radToDeg(e.x), setEulerXInput);
        updateIfChanged(eulerYInput, MathUtils.radToDeg(e.y), setEulerYInput);
        updateIfChanged(eulerZInput, MathUtils.radToDeg(e.z), setEulerZInput);

        // For Axis-Angle, we can keep the strict update since it's not live-edited in the same way
        setAngleInput(MathUtils.radToDeg(aa.angle).toFixed(1));
        setAxisXInput(aa.axis.x.toFixed(2));
        setAxisYInput(aa.axis.y.toFixed(2));
        setAxisZInput(aa.axis.z.toFixed(2));

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

    const handleEulerInputChange = (axis: 'x' | 'y' | 'z', value: string) => {
        if (axis === 'x') setEulerXInput(value);
        else if (axis === 'y') setEulerYInput(value);
        else setEulerZInput(value);

        const num = parseFloat(value);
        if (!isNaN(num)) {
            handleEulerChange(axis, MathUtils.degToRad(num));
        }
    };

    const applyEulerInput = (axis: 'x' | 'y' | 'z') => {
        const value = axis === 'x' ? eulerXInput : axis === 'y' ? eulerYInput : eulerZInput;
        const num = parseFloat(value);
        if (!isNaN(num)) {
            handleEulerChange(axis, MathUtils.degToRad(num));
        }
    };

    const handleAxisAngleInputChange = (field: 'angle' | 'x' | 'y' | 'z', value: string) => {
        if (field === 'angle') setAngleInput(value);
        else if (field === 'x') setAxisXInput(value);
        else if (field === 'y') setAxisYInput(value);
        else setAxisZInput(value);

        // Live update logic
        const num = parseFloat(value);
        if (!isNaN(num)) {
            // We need all 4 values to compute the matrix
            // Use the new value for the changed field, and current state for others
            const angle = field === 'angle' ? num : parseFloat(angleInput);
            const x = field === 'x' ? num : parseFloat(axisXInput);
            const y = field === 'y' ? num : parseFloat(axisYInput);
            const z = field === 'z' ? num : parseFloat(axisZInput);

            if (!isNaN(angle) && !isNaN(x) && !isNaN(y) && !isNaN(z)) {
                const newAxis = new Vector3(x, y, z);
                if (newAxis.lengthSq() > 0.0001) {
                    const m = getMatrixFromAxisAngle(newAxis, MathUtils.degToRad(angle));
                    onChange(m);
                }
            }
        }
    };

    const applyAxisAngleInputs = () => {
        const angle = parseFloat(angleInput);
        const x = parseFloat(axisXInput);
        const y = parseFloat(axisYInput);
        const z = parseFloat(axisZInput);

        if (!isNaN(angle) && !isNaN(x) && !isNaN(y) && !isNaN(z)) {
            const newAxis = new Vector3(x, y, z);

            if (newAxis.lengthSq() > 0.0001) {
                const m = getMatrixFromAxisAngle(newAxis, MathUtils.degToRad(angle));
                onChange(m);
            }
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
                <h3>Euler Angles (Deg)</h3>
                <div className={styles.sliderGroup}>
                    <label>X (°)</label>
                    <input
                        type="number" step="1" value={eulerXInput}
                        onChange={(e) => handleEulerInputChange('x', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyEulerInput('x')}
                        onBlur={() => applyEulerInput('x')}
                        className={styles.numberInput}
                    />
                    <input
                        type="range" min={-180} max={180} step={1}
                        value={parseFloat(eulerXInput) || 0}
                        onChange={(e) => {
                            const val = e.target.value;
                            setEulerXInput(val);
                            handleEulerChange('x', MathUtils.degToRad(parseFloat(val)));
                        }}
                    />
                </div>
                <div className={styles.sliderGroup}>
                    <label>Y (°)</label>
                    <input
                        type="number" step="1" value={eulerYInput}
                        onChange={(e) => handleEulerInputChange('y', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyEulerInput('y')}
                        onBlur={() => applyEulerInput('y')}
                        className={styles.numberInput}
                    />
                    <input
                        type="range" min={-180} max={180} step={1}
                        value={parseFloat(eulerYInput) || 0}
                        onChange={(e) => {
                            const val = e.target.value;
                            setEulerYInput(val);
                            handleEulerChange('y', MathUtils.degToRad(parseFloat(val)));
                        }}
                    />
                </div>
                <div className={styles.sliderGroup}>
                    <label>Z (°)</label>
                    <input
                        type="number" step="1" value={eulerZInput}
                        onChange={(e) => handleEulerInputChange('z', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyEulerInput('z')}
                        onBlur={() => applyEulerInput('z')}
                        className={styles.numberInput}
                    />
                    <input
                        type="range" min={-180} max={180} step={1}
                        value={parseFloat(eulerZInput) || 0}
                        onChange={(e) => {
                            const val = e.target.value;
                            setEulerZInput(val);
                            handleEulerChange('z', MathUtils.degToRad(parseFloat(val)));
                        }}
                    />
                </div>
            </section>

            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, border: 'none', padding: 0 }}>Axis-Angle</h3>
                    <button
                        className={styles.button}
                        style={{ width: 'auto', padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={applyAxisAngleInputs}
                    >
                        Compute
                    </button>
                </div>
                <div className={styles.sliderGroup}>
                    <label>Angle (°)</label>
                    <input
                        type="number" step="1" value={angleInput}
                        onChange={(e) => handleAxisAngleInputChange('angle', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyAxisAngleInputs()}
                        onBlur={() => applyAxisAngleInputs()}
                        className={styles.numberInput}
                    />
                    <input
                        type="range" min={-180} max={180} step={1}
                        value={parseFloat(angleInput) || 0}
                        onChange={(e) => handleAxisAngleInputChange('angle', e.target.value)}
                    />
                </div>
                <div className={styles.sliderGroup}>
                    <label>Axis X</label>
                    <input
                        type="number" step="0.1" value={axisXInput}
                        onChange={(e) => handleAxisAngleInputChange('x', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyAxisAngleInputs()}
                        onBlur={() => applyAxisAngleInputs()}
                        className={styles.numberInput}
                    />
                    <input
                        type="range" min={-1} max={1} step={0.01}
                        value={parseFloat(axisXInput) || 0}
                        onChange={(e) => handleAxisAngleInputChange('x', e.target.value)}
                    />
                </div>
                <div className={styles.sliderGroup}>
                    <label>Axis Y</label>
                    <input
                        type="number" step="0.1" value={axisYInput}
                        onChange={(e) => handleAxisAngleInputChange('y', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyAxisAngleInputs()}
                        onBlur={() => applyAxisAngleInputs()}
                        className={styles.numberInput}
                    />
                    <input
                        type="range" min={-1} max={1} step={0.01}
                        value={parseFloat(axisYInput) || 0}
                        onChange={(e) => handleAxisAngleInputChange('y', e.target.value)}
                    />
                </div>
                <div className={styles.sliderGroup}>
                    <label>Axis Z</label>
                    <input
                        type="number" step="0.1" value={axisZInput}
                        onChange={(e) => handleAxisAngleInputChange('z', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyAxisAngleInputs()}
                        onBlur={() => applyAxisAngleInputs()}
                        className={styles.numberInput}
                    />
                    <input
                        type="range" min={-1} max={1} step={0.01}
                        value={parseFloat(axisZInput) || 0}
                        onChange={(e) => handleAxisAngleInputChange('z', e.target.value)}
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
