'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';

interface CognitiveCoreProps {
    isActive: boolean;
    isThinking?: boolean;
    isListening?: boolean;
    color?: string;
}

const NeuralNode = ({ isActive, isThinking, isListening, color = '#7c3aed' }: CognitiveCoreProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const particlesRef = useRef<THREE.Points>(null);

    // Dynamic speed and distortion based on state
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (meshRef.current) {
            // Pulsing rotation
            meshRef.current.rotation.x = Math.cos(t / 4) * 0.2;
            meshRef.current.rotation.y = Math.sin(t / 2) * 0.2;
            
            // Scaled pulse
            const s = (isActive || isThinking) ? 1 + Math.sin(t * 5) * 0.05 : 1;
            meshRef.current.scale.set(s, s, s);
        }

        if (particlesRef.current) {
            particlesRef.current.rotation.y = t * 0.1;
            if (isActive || isListening) {
                particlesRef.current.rotation.z = Math.sin(t) * 0.2;
            }
        }
    });

    const particlesCount = 200;
    const [positions, step] = useMemo(() => {
        const positions = new Float32Array(particlesCount * 3);
        const step = new Float32Array(particlesCount);
        for (let i = 0; i < particlesCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 5;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
            step[i] = Math.random();
        }
        return [positions, step];
    }, []);

    return (
        <group>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color={color} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
            
            <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                <Sphere args={[1, 64, 64]} ref={meshRef}>
                    <MeshDistortMaterial
                        color={isListening ? '#10b981' : isThinking ? '#3b82f6' : color}
                        speed={isActive ? 4 : 2}
                        distort={isActive ? 0.4 : 0.2}
                        radius={1}
                        emissive={color}
                        emissiveIntensity={isActive ? 1.5 : 0.5}
                        transparent
                        opacity={0.9}
                    />
                </Sphere>
            </Float>

            <points ref={particlesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[positions, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.05}
                    color={isActive ? color : '#ffffff'}
                    transparent
                    opacity={0.6}
                    sizeAttenuation
                    blending={THREE.AdditiveBlending}
                />
            </points>

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </group>
    );
};

export const CognitiveCore3D = (props: CognitiveCoreProps) => {
    return (
        <div className="w-full h-full min-h-[300px] relative pointer-events-none">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <NeuralNode {...props} />
            </Canvas>
            <div className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none`} />
        </div>
    );
};
