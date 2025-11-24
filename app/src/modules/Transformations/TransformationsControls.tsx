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

    // Manual Input States
    const [posXInput, setPosXInput] = useState('0.00');
    const [posYInput, setPosYInput] = useState('0.00');
    const [posZInput, setPosZInput] = useState('0.00');

    const [eulerXInput, setEulerXInput] = useState('0.0');
    const [eulerYInput, setEulerYInput] = useState('0.0');
    const [eulerZInput, setEulerZInput] = useState('0.0');

    const [screwThetaInput, setScrewThetaInput] = useState('0.0');
    const [screwDInput, setScrewDInput] = useState('0.00');

    const [screwSXInput, setScrewSXInput] = useState('0.00');
    const [screwSYInput, setScrewSYInput] = useState('0.00');
    const [screwSZInput, setScrewSZInput] = useState('1.00');

    const [screwCXInput, setScrewCXInput] = useState('0.00');
    const [screwCYInput, setScrewCYInput] = useState('0.00');
    const [screwCZInput, setScrewCZInput] = useState('0.00');

    useEffect(() => {
        const pos = new Vector3().setFromMatrixPosition(matrix);
        const eul = new Euler().setFromRotationMatrix(matrix);
        const scr = getScrewParametersFromMatrix(matrix);

        setPosition(pos);
        setEuler(eul);
        setScrew(scr);

        // Update input fields only if they differ significantly
        const updateIfChanged = (current: string, newVal: number, setter: (v: string) => void, precision: number = 2) => {
            const currentNum = parseFloat(current);
            if (isNaN(currentNum) || Math.abs(currentNum - newVal) > (1 / Math.pow(10, precision + 1))) {
                setter(newVal.toFixed(precision));
            }
        };

        updateIfChanged(posXInput, pos.x, setPosXInput);
        updateIfChanged(posYInput, pos.y, setPosYInput);
        updateIfChanged(posZInput, pos.z, setPosZInput);

        updateIfChanged(eulerXInput, MathUtils.radToDeg(eul.x), setEulerXInput, 1);
        updateIfChanged(eulerYInput, MathUtils.radToDeg(eul.y), setEulerYInput, 1);
        updateIfChanged(eulerZInput, MathUtils.radToDeg(eul.z), setEulerZInput, 1);

        updateIfChanged(screwThetaInput, MathUtils.radToDeg(scr.theta), setScrewThetaInput, 1);
        updateIfChanged(screwDInput, scr.d, setScrewDInput);

        updateIfChanged(screwSXInput, scr.s.x, setScrewSXInput);
        updateIfChanged(screwSYInput, scr.s.y, setScrewSYInput);
        updateIfChanged(screwSZInput, scr.s.z, setScrewSZInput);

        updateIfChanged(screwCXInput, scr.c.x, setScrewCXInput);
        updateIfChanged(screwCYInput, scr.c.y, setScrewCYInput);
        updateIfChanged(screwCZInput, scr.c.z, setScrewCZInput);

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

    const handlePositionInputChange = (axis: 'x' | 'y' | 'z', value: string) => {
        if (axis === 'x') setPosXInput(value);
        else if (axis === 'y') setPosYInput(value);
        else setPosZInput(value);

        const num = parseFloat(value);
        if (!isNaN(num)) {
            handlePositionChange(axis, num);
        }
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

    const handleScrewInputChange = (field: string, value: string) => {
        // Update local state
        switch (field) {
            case 'theta': setScrewThetaInput(value); break;
            case 'd': setScrewDInput(value); break;
            case 'sx': setScrewSXInput(value); break;
            case 'sy': setScrewSYInput(value); break;
            case 'sz': setScrewSZInput(value); break;
            case 'cx': setScrewCXInput(value); break;
            case 'cy': setScrewCYInput(value); break;
            case 'cz': setScrewCZInput(value); break;
        }

        const num = parseFloat(value);
        if (!isNaN(num)) {
            // Construct new screw params from current inputs + new value
            const newScrew = { ...screw, s: screw.s.clone(), c: screw.c.clone() };

            // Use the new value for the target field, current state for others
            // But we must be careful: 'screw' state might be slightly stale compared to inputs if user is typing fast?
            // Actually, for live updates, we should rely on the inputs if we want consistency, 
            // but 'screw' state is updated in useEffect from matrix. 
            // Let's use the 'screw' state as base, which represents the current valid matrix state.

            if (field === 'theta') newScrew.theta = MathUtils.degToRad(num);
            else if (field === 'd') newScrew.d = num;
            else if (field === 'sx') newScrew.s.x = num;
            else if (field === 'sy') newScrew.s.y = num;
            else if (field === 'sz') newScrew.s.z = num;
            else if (field === 'cx') newScrew.c.x = num;
            else if (field === 'cy') newScrew.c.y = num;
            else if (field === 'cz') newScrew.c.z = num;

            if (newScrew.s.lengthSq() > 0.0001) {
                const m = getMatrixFromScrewParameters(newScrew);
                onChange(m);
            }
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
                <div className={styles.sliderGroup}>
                    <label>X</label>
                    <input
                        type="number" step="0.1" value={posXInput}
                        onChange={(e) => handlePositionInputChange('x', e.target.value)}
                        className={styles.numberInput}
                    />
                    <input
                        type="range" min={-5} max={5} step={0.01}
                        value={parseFloat(posXInput) || 0}
                        onChange={(e) => handlePositionInputChange('x', e.target.value)}
                    />
                </div>
                <div className={styles.sliderGroup}>
                    <label>Y</label>
                    <input
                        type="number" step="0.1" value={posYInput}
                        onChange={(e) => handlePositionInputChange('y', e.target.value)}
                        className={styles.numberInput}
                    />
                    <input
                        type="range" min={-5} max={5} step={0.01}
                        value={parseFloat(posYInput) || 0}
                        onChange={(e) => handlePositionInputChange('y', e.target.value)}
                    />
                </div>
                <div className={styles.sliderGroup}>
                    <label>Z</label>
                    <input
                        type="number" step="0.1" value={posZInput}
                        onChange={(e) => handlePositionInputChange('z', e.target.value)}
                        className={styles.numberInput}
                    />
                    <input
                        type="range" min={-5} max={5} step={0.01}
                        value={parseFloat(posZInput) || 0}
                        onChange={(e) => handlePositionInputChange('z', e.target.value)}
                    />
                </div>
            </section>

            <section>
                <h3>Rotation (Euler Deg)</h3>
                <div className={styles.sliderGroup}>
                    <label>X (°)</label>
                    <input
                        type="number" step="1" value={eulerXInput}
                        onChange={(e) => handleEulerInputChange('x', e.target.value)}
                        className={styles.numberInput}
                    />
                    <input
                        type="range" min={-180} max={180} step={1}
                        value={parseFloat(eulerXInput) || 0}
                        onChange={(e) => handleEulerInputChange('x', e.target.value)}
                    />
                </div>
                <div className={styles.sliderGroup}>
                    <label>Y (°)</label>
                    <input
                        type="number" step="1" value={eulerYInput}
                        onChange={(e) => handleEulerInputChange('y', e.target.value)}
                        className={styles.numberInput}
                    />
                    <input
                        type="range" min={-180} max={180} step={1}
                        value={parseFloat(eulerYInput) || 0}
                        onChange={(e) => handleEulerInputChange('y', e.target.value)}
                    />
                </div>
                <div className={styles.sliderGroup}>
                    <label>Z (°)</label>
                    <input
                        type="number" step="1" value={eulerZInput}
                        onChange={(e) => handleEulerInputChange('z', e.target.value)}
                        className={styles.numberInput}
                    />
                    <input
                        type="range" min={-180} max={180} step={1}
                        value={parseFloat(eulerZInput) || 0}
                        onChange={(e) => handleEulerInputChange('z', e.target.value)}
                    />
                </div>
            </section>

            <section>
                <h3>Screw Parameters</h3>
                <div className={styles.sliderGroup}>
                    <label>Angle θ (°)</label>
                    <input
                        type="number" step="1" value={screwThetaInput}
                        onChange={(e) => handleScrewInputChange('theta', e.target.value)}
                        className={styles.numberInput}
                    />
                    <input
                        type="range" min={-180} max={180} step={1}
                        value={parseFloat(screwThetaInput) || 0}
                        onChange={(e) => handleScrewInputChange('theta', e.target.value)}
                    />
                </div>
                <div className={styles.sliderGroup}>
                    <label>Trans d</label>
                    <input
                        type="number" step="0.1" value={screwDInput}
                        onChange={(e) => handleScrewInputChange('d', e.target.value)}
                        className={styles.numberInput}
                    />
                    <input
                        type="range" min={-5} max={5} step={0.01}
                        value={parseFloat(screwDInput) || 0}
                        onChange={(e) => handleScrewInputChange('d', e.target.value)}
                    />
                </div>

                <h4>Screw Axis Direction (s)</h4>
                <div className={styles.sliderGroup}>
                    <label>X</label>
                    <input
                        type="number" step="0.1" value={screwSXInput}
                        onChange={(e) => handleScrewInputChange('sx', e.target.value)}
                        className={styles.numberInput}
                    />
                    <input
                        type="range" min={-1} max={1} step={0.01}
                        value={parseFloat(screwSXInput) || 0}
                        onChange={(e) => handleScrewInputChange('sx', e.target.value)}
                    />
                </div>
                <div className={styles.sliderGroup}>
                    <label>Y</label>
                    <input
                        type="number" step="0.1" value={screwSYInput}
                        onChange={(e) => handleScrewInputChange('sy', e.target.value)}
                        className={styles.numberInput}
                    />
                    <input
                        type="range" min={-1} max={1} step={0.01}
                        value={parseFloat(screwSYInput) || 0}
                        onChange={(e) => handleScrewInputChange('sy', e.target.value)}
                    />
                </div>
                <div className={styles.sliderGroup}>
                    <label>Z</label>
                    <input
                        type="number" step="0.1" value={screwSZInput}
                        onChange={(e) => handleScrewInputChange('sz', e.target.value)}
                        className={styles.numberInput}
                    />
                    <input
                        type="range" min={-1} max={1} step={0.01}
                        value={parseFloat(screwSZInput) || 0}
                        onChange={(e) => handleScrewInputChange('sz', e.target.value)}
                    />
                </div>

                <h4>Point on Axis (C)</h4>
                <div className={styles.sliderGroup}>
                    <label>X</label>
                    <input
                        type="number" step="0.1" value={screwCXInput}
                        onChange={(e) => handleScrewInputChange('cx', e.target.value)}
                        className={styles.numberInput}
                    />
                    <input
                        type="range" min={-5} max={5} step={0.01}
                        value={parseFloat(screwCXInput) || 0}
                        onChange={(e) => handleScrewInputChange('cx', e.target.value)}
                    />
                </div>
                <div className={styles.sliderGroup}>
                    <label>Y</label>
                    <input
                        type="number" step="0.1" value={screwCYInput}
                        onChange={(e) => handleScrewInputChange('cy', e.target.value)}
                        className={styles.numberInput}
                    />
                    <input
                        type="range" min={-5} max={5} step={0.01}
                        value={parseFloat(screwCYInput) || 0}
                        onChange={(e) => handleScrewInputChange('cy', e.target.value)}
                    />
                </div>
                <div className={styles.sliderGroup}>
                    <label>Z</label>
                    <input
                        type="number" step="0.1" value={screwCZInput}
                        onChange={(e) => handleScrewInputChange('cz', e.target.value)}
                        className={styles.numberInput}
                    />
                    <input
                        type="range" min={-5} max={5} step={0.01}
                        value={parseFloat(screwCZInput) || 0}
                        onChange={(e) => handleScrewInputChange('cz', e.target.value)}
                    />
                </div>
            </section>

            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, border: 'none', padding: 0 }}>Matrix (3x4)</h3>
                    <button
                        className={styles.button}
                        style={{ width: 'auto', padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={handleCopyMatrix}
                    >
                        {copyFeedback ? "Copied!" : "Copy"}
                    </button>
                </div>
                <div className={styles.matrixGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    {[0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14].map((idx) => (
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
