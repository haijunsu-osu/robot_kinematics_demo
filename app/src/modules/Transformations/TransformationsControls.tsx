import React, { useState, useEffect } from 'react';
import { Matrix4, Euler, Vector3, MathUtils } from 'three';
import styles from '../Rotations/RotationsControls.module.css';
import { getScrewParametersFromMatrix, getMatrixFromScrewParameters } from '../../utils/robotics';
import type { ScrewParameters } from '../../utils/robotics';

interface TransformationsControlsProps {
    matrix: Matrix4;
    onChange: (m: Matrix4) => void;
}

export const TransformationsControls: React.FC<TransformationsControlsProps> = ({ matrix, onChange }) => {
    const [position, setPosition] = useState(new Vector3());
    const [euler, setEuler] = useState(new Euler());

    // Screw Parameters State
    const [screw, setScrew] = useState<ScrewParameters>({
        theta: 0, d: 0, s: new Vector3(0, 0, 1), c: new Vector3(0, 0, 0)
    });

    useEffect(() => {
        setPosition(new Vector3().setFromMatrixPosition(matrix));
        setEuler(new Euler().setFromRotationMatrix(matrix));
        setScrew(getScrewParametersFromMatrix(matrix));
    }, [matrix]);

    const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
        const newPos = position.clone();
        newPos[axis] = value;
        const newMatrix = matrix.clone();
        newMatrix.setPosition(newPos);
        onChange(newMatrix);
    };

    const handleEulerChange = (axis: 'x' | 'y' | 'z', value: number) => {
        const newEuler = euler.clone();
        newEuler[axis] = value;
        const newMatrix = new Matrix4().makeRotationFromEuler(newEuler);
        newMatrix.setPosition(position);
        onChange(newMatrix);
    };

    const handleScrewChange = (field: keyof ScrewParameters | 'sx' | 'sy' | 'sz' | 'cx' | 'cy' | 'cz', value: number) => {
        const newScrew = { ...screw, s: screw.s.clone(), c: screw.c.clone() };

        if (field === 'theta') newScrew.theta = MathUtils.degToRad(value);
        else if (field === 'd') newScrew.d = value;
        else if (field === 'sx') newScrew.s.x = value;
        else if (field === 'sy') newScrew.s.y = value;
        else if (field === 'sz') newScrew.s.z = value;
        else if (field === 'cx') newScrew.c.x = value;
        else if (field === 'cy') newScrew.c.y = value;
        else if (field === 'cz') newScrew.c.z = value;

        setScrew(newScrew); // Optimistic update

        // Avoid zero vector for axis
        if (newScrew.s.lengthSq() > 0.0001) {
            const m = getMatrixFromScrewParameters(newScrew);
            onChange(m);
        }
    };

    const [inputText, setInputText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [copyFeedback, setCopyFeedback] = useState(false);

    const handleCopyMatrix = () => {
        const e = matrix.elements;
        // Format: row-major, space separated cols, semicolon separated rows
        const row1 = `${e[0].toFixed(4)} ${e[4].toFixed(4)} ${e[8].toFixed(4)} ${e[12].toFixed(4)}`;
        const row2 = `${e[1].toFixed(4)} ${e[5].toFixed(4)} ${e[9].toFixed(4)} ${e[13].toFixed(4)}`;
        const row3 = `${e[2].toFixed(4)} ${e[6].toFixed(4)} ${e[10].toFixed(4)} ${e[14].toFixed(4)}`;
        const row4 = `${e[3].toFixed(4)} ${e[7].toFixed(4)} ${e[11].toFixed(4)} ${e[15].toFixed(4)}`;
        const text = `${row1}; ${row2}; ${row3}; ${row4}`;

        navigator.clipboard.writeText(text).then(() => {
            setCopyFeedback(true);
            setTimeout(() => setCopyFeedback(false), 2000);
        });
    };

    const handleParseAndCompute = () => {
        setError(null);
        // Split by comma, space, tab, colon, newline, curly braces
        const tokens = inputText.trim().split(/[\s,;:\t\n{}]+/).filter(t => t.length > 0);
        const numbers = tokens.map(t => parseFloat(t));

        if (numbers.some(isNaN)) {
            setError("Invalid numbers detected");
            return;
        }

        if (numbers.length !== 16) {
            setError(`Expected 16 numbers, found ${numbers.length}`);
            return;
        }

        const m = new Matrix4();
        m.set(
            numbers[0], numbers[1], numbers[2], numbers[3],
            numbers[4], numbers[5], numbers[6], numbers[7],
            numbers[8], numbers[9], numbers[10], numbers[11],
            numbers[12], numbers[13], numbers[14], numbers[15]
        );

        onChange(m);
    };

    return (
        <div className={styles.wrapper}>
            <section>
                <h3>Position</h3>
                <div className={styles.inputGroup}>
                    <label>X</label>
                    <input type="number" step="0.1" value={position.x.toFixed(2)} onChange={(e) => handlePositionChange('x', parseFloat(e.target.value))} />
                </div>
                <div className={styles.inputGroup}>
                    <label>Y</label>
                    <input type="number" step="0.1" value={position.y.toFixed(2)} onChange={(e) => handlePositionChange('y', parseFloat(e.target.value))} />
                </div>
                <div className={styles.inputGroup}>
                    <label>Z</label>
                    <input type="number" step="0.1" value={position.z.toFixed(2)} onChange={(e) => handlePositionChange('z', parseFloat(e.target.value))} />
                </div>
            </section>

            <section>
                <h3>Rotation (Euler)</h3>
                <div className={styles.sliderGroup}>
                    <label>X: {euler.x.toFixed(2)}</label>
                    <input type="range" min={-Math.PI} max={Math.PI} step={0.01} value={euler.x} onChange={(e) => handleEulerChange('x', parseFloat(e.target.value))} />
                </div>
                <div className={styles.sliderGroup}>
                    <label>Y: {euler.y.toFixed(2)}</label>
                    <input type="range" min={-Math.PI} max={Math.PI} step={0.01} value={euler.y} onChange={(e) => handleEulerChange('y', parseFloat(e.target.value))} />
                </div>
                <div className={styles.sliderGroup}>
                    <label>Z: {euler.z.toFixed(2)}</label>
                    <input type="range" min={-Math.PI} max={Math.PI} step={0.01} value={euler.z} onChange={(e) => handleEulerChange('z', parseFloat(e.target.value))} />
                </div>
            </section>

            <section>
                <h3>Screw Parameters</h3>
                <div className={styles.inputGroup}>
                    <label>Angle θ (°)</label>
                    <input type="number" step="1" value={MathUtils.radToDeg(screw.theta).toFixed(1)} onChange={(e) => handleScrewChange('theta', parseFloat(e.target.value))} />
                </div>
                <div className={styles.inputGroup}>
                    <label>Trans d</label>
                    <input type="number" step="0.1" value={screw.d.toFixed(2)} onChange={(e) => handleScrewChange('d', parseFloat(e.target.value))} />
                </div>

                <h4>Screw Axis Direction (s)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <input className={styles.matrixInput} type="number" step="0.1" value={screw.s.x.toFixed(2)} onChange={(e) => handleScrewChange('sx', parseFloat(e.target.value))} placeholder="x" />
                    <input className={styles.matrixInput} type="number" step="0.1" value={screw.s.y.toFixed(2)} onChange={(e) => handleScrewChange('sy', parseFloat(e.target.value))} placeholder="y" />
                    <input className={styles.matrixInput} type="number" step="0.1" value={screw.s.z.toFixed(2)} onChange={(e) => handleScrewChange('sz', parseFloat(e.target.value))} placeholder="z" />
                </div>

                <h4>Point on Axis (C)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <input className={styles.matrixInput} type="number" step="0.1" value={screw.c.x.toFixed(2)} onChange={(e) => handleScrewChange('cx', parseFloat(e.target.value))} placeholder="x" />
                    <input className={styles.matrixInput} type="number" step="0.1" value={screw.c.y.toFixed(2)} onChange={(e) => handleScrewChange('cy', parseFloat(e.target.value))} placeholder="y" />
                    <input className={styles.matrixInput} type="number" step="0.1" value={screw.c.z.toFixed(2)} onChange={(e) => handleScrewChange('cz', parseFloat(e.target.value))} placeholder="z" />
                </div>
            </section>

            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, border: 'none', padding: 0 }}>Matrix (4x4)</h3>
                    <button
                        className={styles.button}
                        style={{ width: 'auto', padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={handleCopyMatrix}
                    >
                        {copyFeedback ? "Copied!" : "Copy"}
                    </button>
                </div>
                <div className={styles.matrixGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    {[0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15].map((idx) => (
                        <div key={idx} className={styles.matrixInput} style={{ background: 'var(--bg-primary)', border: 'none', padding: '0.25rem', fontSize: '0.8rem' }}>
                            {matrix.elements[idx].toFixed(2)}
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h3>Matrix Input</h3>
                <textarea
                    className={styles.textarea}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste 4x4 matrix here (space, comma, tab, colon, or {} separated)"
                />
                <button className={styles.button} onClick={handleParseAndCompute}>
                    Parse & Update
                </button>
                {error && <div style={{ color: 'var(--error-color, #ff4444)', marginTop: '0.5rem', fontSize: '0.9rem' }}>{error}</div>}
            </section>
        </div>
    );
};
