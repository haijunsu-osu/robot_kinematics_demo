import React from 'react';
import { calculateDHMatrix } from '../../utils/robotics';
import type { DHRow } from '../../utils/robotics';
import { Matrix4 } from 'three';
import { v4 as uuidv4 } from 'uuid';
import styles from '../Rotations/RotationsControls.module.css';
import { Plus, Trash2, Copy, ClipboardPaste } from 'lucide-react';

interface RobotControlsProps {
    rows: DHRow[];
    setRows: React.Dispatch<React.SetStateAction<DHRow[]>>;
    axisLength: number;
    setAxisLength: (l: number) => void;
    visibleFrames: Set<number>;
    toggleFrameVisibility: (index: number) => void;
}

export const RobotControls: React.FC<RobotControlsProps> = ({ rows, setRows, axisLength, setAxisLength, visibleFrames, toggleFrameVisibility }) => {
    const addRow = () => {
        setRows([...rows, { id: uuidv4(), a: 1, alpha: 0, d: 0, theta: 0 }]);
    };

    const removeRow = (id: string) => {
        setRows(rows.filter(r => r.id !== id));
    };

    const updateRow = (id: string, field: keyof DHRow, value: number) => {
        setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const copyDHTable = async () => {
        // Format: each row as "a alpha d theta" separated by newlines
        // Convert alpha and theta to degrees for clipboard
        const text = rows.map(r => {
            const alphaDeg = r.alpha * 180 / Math.PI;
            const thetaDeg = r.theta * 180 / Math.PI;
            return `${r.a}\t${alphaDeg.toFixed(2)}\t${r.d}\t${thetaDeg.toFixed(2)}`;
        }).join('\n');
        try {
            await navigator.clipboard.writeText(text);
            alert('DH parameters (degrees) copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
            alert('Failed to copy to clipboard');
        }
    };

    const pasteDHTable = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const lines = text.trim().split('\n');
            const newRows: DHRow[] = [];

            for (const line of lines) {
                // Support tab, comma, space, or semicolon delimiters
                const values = line.split(/[\t,;\s]+/).map(v => parseFloat(v.trim()));
                if (values.length >= 4 && values.every(v => !isNaN(v))) {
                    newRows.push({
                        id: uuidv4(),
                        a: values[0],
                        alpha: values[1] * Math.PI / 180, // Convert deg to rad
                        d: values[2],
                        theta: values[3] * Math.PI / 180  // Convert deg to rad
                    });
                }
            }

            if (newRows.length > 0) {
                setRows(newRows);
                alert(`Pasted ${newRows.length} DH parameter rows (assumed degrees)!`);
            } else {
                alert('No valid DH parameters found. Expected: a alpha(deg) d theta(deg)');
            }
        } catch (err) {
            console.error('Failed to paste:', err);
            alert('Failed to read from clipboard');
        }
    };

    const copyEndEffectorPose = () => {
        let current = new Matrix4();
        rows.forEach(row => {
            const transform = calculateDHMatrix(row.a, row.alpha, row.d, row.theta);
            current = current.multiply(transform);
        });

        // Format as row-major 4x4 matrix
        const elements = current.elements;
        const matrix4x4 = [
            [elements[0], elements[4], elements[8], elements[12]],
            [elements[1], elements[5], elements[9], elements[13]],
            [elements[2], elements[6], elements[10], elements[14]],
            [elements[3], elements[7], elements[11], elements[15]]
        ];

        const text = matrix4x4.map(row => row.map(v => v.toFixed(6)).join('\t')).join('\n');

        navigator.clipboard.writeText(text).then(() => {
            alert('End-effector pose matrix copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy to clipboard');
        });
    };

    return (
        <div className={styles.wrapper}>


            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                    <h3 style={{ margin: 0, border: 'none', padding: 0 }}>DH Parameters (Standard)</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={addRow} title="Add Link" style={{ padding: '4px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <Plus size={16} />
                        </button>
                        <button onClick={copyDHTable} title="Copy Table" style={{ padding: '4px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <Copy size={16} />
                        </button>
                        <button onClick={pasteDHTable} title="Paste Table" style={{ padding: '4px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <ClipboardPaste size={16} />
                        </button>
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                                <th style={{ padding: '0.25rem' }}>Link</th>
                                <th style={{ padding: '0.25rem' }}>a</th>
                                <th style={{ padding: '0.25rem' }}>α (deg)</th>
                                <th style={{ padding: '0.25rem' }}>d</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <tr key={row.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '0.25rem' }}>{index + 1}</td>
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
                                            step="1"
                                            value={(row.alpha * 180 / Math.PI).toFixed(1)}
                                            onChange={(e) => updateRow(row.id, 'alpha', parseFloat(e.target.value) * Math.PI / 180)}
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
            </section>

            <section>
                <h3>Joint Angles (Degrees)</h3>
                {rows.map((row, index) => (
                    <div key={row.id} className={styles.sliderGroup}>
                        <label style={{ minWidth: '30px' }}>J{index + 1}</label>
                        <input
                            type="number"
                            value={(row.theta * 180 / Math.PI).toFixed(1)}
                            onChange={(e) => updateRow(row.id, 'theta', parseFloat(e.target.value) * Math.PI / 180)}
                            className={styles.numberInput}
                            style={{ width: '60px', marginRight: '0.5rem' }}
                        />
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                    <h3 style={{ margin: 0, border: 'none', padding: 0 }}>Forward Kinematics</h3>
                    <button onClick={copyEndEffectorPose} title="Copy Pose Matrix" style={{ padding: '4px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <Copy size={16} />
                    </button>
                </div>
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
                        // Display in row-major order (3x4)
                        return [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14].map((idx) => (
                            <div key={idx} className={styles.matrixInput} style={{ background: 'var(--bg-primary)', border: 'none', padding: '0.25rem', fontSize: '0.8rem' }}>
                                {current.elements[idx].toFixed(2)}
                            </div>
                        ));
                    })()}
                </div>
            </section>

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
                <div className={styles.row} style={{ marginTop: '0.5rem', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <label style={{ width: 'auto', marginBottom: '0.25rem' }}>Visible Frames:</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'auto', fontWeight: 'normal', fontSize: '0.8rem' }}>
                            <input
                                type="checkbox"
                                checked={visibleFrames.has(0)}
                                onChange={() => toggleFrameVisibility(0)}
                            />
                            Base
                        </label>
                        {rows.map((_, i) => (
                            <label key={i + 1} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'auto', fontWeight: 'normal', fontSize: '0.8rem' }}>
                                <input
                                    type="checkbox"
                                    checked={visibleFrames.has(i + 1)}
                                    onChange={() => toggleFrameVisibility(i + 1)}
                                />
                                J{i + 1}
                            </label>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};
