import React, { useMemo } from 'react';
import { Matrix4, Vector3, Euler, Quaternion } from 'three';
import { Text } from '@react-three/drei';

interface FrameProps {
    matrix?: Matrix4;
    position?: [number, number, number];
    rotation?: [number, number, number]; // Euler
    quaternion?: Quaternion;
    scale?: number;
    label?: string;
}

const Axis: React.FC<{ color: string; direction: [number, number, number]; label: string }> = ({ color, direction, label }) => {
    const length = 1;
    const radius = 0.02;

    let rotation: [number, number, number] = [0, 0, 0];
    if (direction[0] === 1) rotation = [0, 0, -Math.PI / 2];
    if (direction[2] === 1) rotation = [Math.PI / 2, 0, 0];

    return (
        <group rotation={new Euler(...rotation)}>
            <mesh position={[0, length / 2, 0]}>
                <cylinderGeometry args={[radius, radius, length, 16]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0, length, 0]}>
                <coneGeometry args={[radius * 3, radius * 6, 16]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <Text
                position={[0, length + 0.2, 0]}
                fontSize={0.2}
                color={color}
                anchorX="center"
                anchorY="middle"
            >
                {label}
            </Text>
        </group>
    );
};

export const CoordinateFrame: React.FC<FrameProps> = ({
    matrix,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    quaternion,
    scale = 1,
    label
}) => {

    const finalMatrix = useMemo(() => {
        const m = new Matrix4();
        if (matrix) {
            m.copy(matrix);
        } else {
            m.compose(
                new Vector3(...position),
                quaternion || new Quaternion().setFromEuler(new Euler(...rotation)),
                new Vector3(scale, scale, scale)
            );
        }
        return m;
    }, [matrix, position, rotation, quaternion, scale]);

    return (
        <group matrixAutoUpdate={false} matrix={finalMatrix}>
            <Axis color="#ef4444" direction={[1, 0, 0]} label="X" />
            <Axis color="#22c55e" direction={[0, 1, 0]} label="Y" />
            <Axis color="#3b82f6" direction={[0, 0, 1]} label="Z" />
            {label && (
                <Text
                    position={[0, 0, 0]}
                    fontSize={0.3}
                    color="white"
                    anchorX="left"
                    anchorY="top"
                    position-y={-0.2}
                >
                    {label}
                </Text>
            )}
        </group>
    );
};
