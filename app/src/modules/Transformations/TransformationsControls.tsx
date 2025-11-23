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
                <h3>Matrix (4x4)</h3>
                <div className={styles.matrixGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    {[0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15].map((idx) => (
                        <div key={idx} className={styles.matrixInput} style={{ background: 'var(--bg-primary)', border: 'none', padding: '0.25rem', fontSize: '0.8rem' }}>
                            {matrix.elements[idx].toFixed(2)}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};
