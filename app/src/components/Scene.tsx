import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera, GizmoHelper, GizmoViewcube } from '@react-three/drei';

interface SceneProps {
    children: React.ReactNode;
}

export const Scene: React.FC<SceneProps> = ({ children }) => {
    return (
        <Canvas className="canvas-container">
            <PerspectiveCamera makeDefault position={[4, -4, 4]} up={[0, 0, 1]} />
            <OrbitControls makeDefault />

            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <directionalLight position={[-5, 5, 5]} intensity={0.5} />

            <Grid
                position={[0, 0, -0.01]}
                rotation={[Math.PI / 2, 0, 0]}
                args={[10, 10]}
                cellColor="#334155"
                sectionColor="#475569"
                fadeDistance={20}
            />

            <axesHelper args={[1]} /> {/* World Frame */}

            <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                <GizmoViewcube />
            </GizmoHelper>

            {children}
        </Canvas>
    );
};
