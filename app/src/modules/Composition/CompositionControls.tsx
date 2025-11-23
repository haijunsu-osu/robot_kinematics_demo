import React, { useState } from 'react';
import { Matrix4 } from 'three';
import { v4 as uuidv4 } from 'uuid';
import type { TransformStep } from './CompositionModule';
import { TransformationsControls } from '../Transformations/TransformationsControls';
import styles from '../Rotations/RotationsControls.module.css';
import { Trash2, ArrowUp, ArrowDown, Plus, Calculator, Settings } from 'lucide-react';

interface CompositionControlsProps {
    steps: TransformStep[];
    setSteps: React.Dispatch<React.SetStateAction<TransformStep[]>>;
    mode: 'intrinsic' | 'extrinsic';
    setMode: (mode: 'intrinsic' | 'extrinsic') => void;
    finalMatrix: Matrix4;
}

export const CompositionControls: React.FC<CompositionControlsProps> = ({ steps, setSteps, mode, setMode, finalMatrix }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'input' | 'computation'>('input');

    const addStep = () => {
        const newStep: TransformStep = {
            id: uuidv4(),
            name: `Step ${steps.length + 1}`,
            matrix: new Matrix4(),
            active: true,
        };
        setSteps([...steps, newStep]);
        setSelectedId(newStep.id);
    };

    const updateStepMatrix = (id: string, newMatrix: Matrix4) => {
        setSteps(steps.map(s => s.id === id ? { ...s, matrix: newMatrix } : s));
    };

    const removeStep = (id: string) => {
        setSteps(steps.filter(s => s.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    const moveStep = (index: number, direction: -1 | 1) => {
        if (index + direction < 0 || index + direction >= steps.length) return;
        const newSteps = [...steps];
        const temp = newSteps[index];
        newSteps[index] = newSteps[index + direction];
        newSteps[index + direction] = temp;
        setSteps(newSteps);
    };

    const selectedStep = steps.find(s => s.id === selectedId);

    return (
        <div className={styles.wrapper}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                <button
                    style={{
                        flex: 1,
                        background: activeTab === 'input' ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                        color: activeTab === 'input' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        borderBottom: activeTab === 'input' ? '2px solid var(--accent-primary)' : 'none',
                        borderRadius: 0,
                        padding: '0.75rem',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
                    }}
                    onClick={() => setActiveTab('input')}
                >
                    <Settings size={16} /> Inputs
                </button>
                <button
                    style={{
                        flex: 1,
                        background: activeTab === 'computation' ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                        color: activeTab === 'computation' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        borderBottom: activeTab === 'computation' ? '2px solid var(--accent-primary)' : 'none',
                        borderRadius: 0,
                        padding: '0.75rem',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
                    }}
                    onClick={() => setActiveTab('computation')}
                >
                    <Calculator size={16} /> Computation
                </button>
            </div>

            {activeTab === 'input' ? (
                <>
                    <section>
                        <h3>Composition Mode</h3>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label>
                                <input
                                    type="radio"
                                    checked={mode === 'intrinsic'}
                                    onChange={() => setMode('intrinsic')}
                                /> Intrinsic (Moving Frame)
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    checked={mode === 'extrinsic'}
                                    onChange={() => setMode('extrinsic')}
                                /> Extrinsic (Fixed Frame)
                            </label>
                        </div>
                    </section>

                    <section>
                        <h3>Transformation Chain</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {steps.map((step, index) => (
                                <div
                                    key={step.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem',
                                        background: selectedId === step.id ? 'rgba(56, 189, 248, 0.1)' : 'var(--bg-secondary)',
                                        border: selectedId === step.id ? '1px solid var(--accent-primary)' : '1px solid transparent',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setSelectedId(step.id)}
                                >
                                    <span style={{ flex: 1, fontWeight: 500 }}>{step.name}</span>
                                    <button onClick={(e) => { e.stopPropagation(); moveStep(index, -1); }} disabled={index === 0} style={{ padding: '4px' }}><ArrowUp size={14} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); moveStep(index, 1); }} disabled={index === steps.length - 1} style={{ padding: '4px' }}><ArrowDown size={14} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); removeStep(step.id); }} style={{ padding: '4px', color: '#ef4444' }}><Trash2 size={14} /></button>
                                </div>
                            ))}
                            <button onClick={addStep} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <Plus size={16} /> Add Transformation
                            </button>
                        </div>
                    </section>

                    {selectedStep && (
                        <section>
                            <h3>Edit: {selectedStep.name}</h3>
                            <TransformationsControls
                                matrix={selectedStep.matrix}
                                onChange={(m) => updateStepMatrix(selectedStep.id, m)}
                            />
                        </section>
                    )}
                </>
            ) : (
                <>
                    <section>
                        <h3>Final Transformation Matrix</h3>
                        <div className={styles.matrixGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                            {finalMatrix.elements.map((val, idx) => (
                                <div key={idx} className={styles.matrixInput} style={{ background: 'var(--bg-primary)', border: 'none' }}>
                                    {val.toFixed(3)}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h3>Computation Details</h3>
                        <p><strong>Mode:</strong> {mode === 'intrinsic' ? 'Intrinsic (Post-Multiply)' : 'Extrinsic (Pre-Multiply)'}</p>

                        <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                            {steps.length === 0 ? 'Identity' : (
                                mode === 'intrinsic'
                                    ? `T_final = ${steps.map(s => s.name).join(' * ')}`
                                    : `T_final = ${[...steps].reverse().map(s => s.name).join(' * ')}`
                            )}
                        </div>

                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                            {mode === 'intrinsic'
                                ? "In Intrinsic composition, each transformation is applied relative to the CURRENT moving frame. Mathematically, this corresponds to post-multiplication: T_new = T_current * T_step."
                                : "In Extrinsic composition, each transformation is applied relative to the FIXED world frame. Mathematically, this corresponds to pre-multiplication: T_new = T_step * T_current."
                            }
                        </p>
                    </section>
                </>
            )}
        </div>
    );
};
