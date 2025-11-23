import React from 'react';
import { calculateDHMatrix } from '../../utils/robotics';
import type { DHRow } from '../../utils/robotics';
import { Matrix4 } from 'three';
import { v4 as uuidv4 } from 'uuid';
import styles from '../Rotations/RotationsControls.module.css';
import { Plus, Trash2 } from 'lucide-react';

interface RobotControlsProps {
    rows: DHRow[];
    setRows: React.Dispatch<React.SetStateAction<DHRow[]>>;
    axisLength: number;
    setAxisLength: (l: number) => void;
}

export const RobotControls: React.FC<RobotControlsProps> = ({ rows, setRows, axisLength, setAxisLength }) => {
    const addRow = () => {
        setRows([...rows, { id: uuidv4(), a: 1, alpha: 0, d: 0, theta: 0 }]);
    };

    const removeRow = (id: string) => {
        setRows(rows.filter(r => r.id !== id));
    };

    const updateRow = (id: string, field: keyof DHRow, value: number) => {
        setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    return (
        <div className={styles.wrapper}>
            <section>
                <h3>Visualization Settings</h3>
                <div className={styles.sliderGroup}>
                    <label>Axis Length: {axisLength.toFixed(2)}</label>
                    <input
                        type="range"
                        min="0.1"
                        max="2.0"
                        step="0.1"
                        value={axisLength}
                        onChange={(e) => setAxisLength(parseFloat(e.target.value))}
                    />
                </div>
            </section>

            <section>
                <h3>DH Parameters (Standard)</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                                <th style={{ padding: '0.5rem' }}>Link</th>
                                <th style={{ padding: '0.5rem' }}>a</th>
                                <th style={{ padding: '0.5rem' }}>α (rad)</th>
                                <th style={{ padding: '0.5rem' }}>d</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <tr key={row.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '0.5rem' }}>{index + 1}</td>
                                    <td style={{ padding: '0.25rem' }}>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={row.a}
                                            onChange={(e) => updateRow(row.id, 'a', parseFloat(e.target.value))}
                                            style={{ width: '60px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }}
                                        />
                                    </td>
                                    <td style={{ padding: '0.25rem' }}>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={row.alpha}
                                            onChange={(e) => updateRow(row.id, 'alpha', parseFloat(e.target.value))}
                                            style={{ width: '60px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }}
                                        />
                                    </td>
                                    <td style={{ padding: '0.25rem' }}>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={row.d}
                                            onChange={(e) => updateRow(row.id, 'd', parseFloat(e.target.value))}
                                            style={{ width: '60px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }}
                                        />
                                    </td>
                                    <td style={{ padding: '0.25rem' }}>
                                        <button onClick={() => removeRow(row.id)} style={{ padding: '4px', color: '#ef4444', background: 'transparent', border: 'none' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button onClick={addRow} style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={16} /> Add Link
                </button>
            </section>

            <section>
                <h3>Joint Angles (Degrees)</h3>
                {rows.map((row, index) => (
                    <div key={row.id} className={styles.sliderGroup}>
                        <label>J{index + 1}: {(row.theta * 180 / Math.PI).toFixed(1)}°</label>
                        <input
                            type="range"
                            min={-180}
                            max={180}
                            step={1}
                            value={row.theta * 180 / Math.PI}
                            onChange={(e) => updateRow(row.id, 'theta', parseFloat(e.target.value) * Math.PI / 180)}
                        />
                    </div>
                ))}
            </section>

            <section>
                <h3>Forward Kinematics</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    End-Effector Pose (relative to Base):
                </p>
                <div className={styles.matrixGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    {(() => {
                        let current = new Matrix4();
                        rows.forEach(row => {
                            const transform = calculateDHMatrix(row.a, row.alpha, row.d, row.theta);
                            current = current.multiply(transform);
                        });
                        // Display in row-major order
                        return [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15].map((idx) => (
                            <div key={idx} className={styles.matrixInput} style={{ background: 'var(--bg-primary)', border: 'none', padding: '0.25rem', fontSize: '0.8rem' }}>
                                {current.elements[idx].toFixed(2)}
                            </div>
                        ));
                    })()}
                </div>
            </section>
        </div>
    );
};
