import { Canvas } from '@react-three/fiber';
import { OrbitControls, Billboard, Image, Float } from '@react-three/drei';
import * as THREE from 'three';

interface HologramViewerProps {
    imageUrl: string;
    prompt: string;
}

const HologramPlane = ({ imageUrl }: { imageUrl: string }) => {
    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Billboard>
                <Image
                    url={imageUrl}
                    transparent
                    opacity={0.9}
                    scale={[4, 4]}
                    toneMapped={false}
                />
            </Billboard>
        </Float>
    );
};

const HoloBase = () => {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
            <circleGeometry args={[3, 32]} />
            <meshStandardMaterial
                color="#00ffff"
                emissive="#00ffff"
                emissiveIntensity={2}
                transparent
                opacity={0.2}
                wireframe
            />
        </mesh>
    );
};

export const HologramViewer: React.FC<HologramViewerProps> = ({ imageUrl, prompt }) => {
    return (
        <div className="w-full h-full bg-black/95 relative overflow-hidden rounded-xl border border-white/10 shadow-[0_0_50px_rgba(0,255,255,0.1)]">
            {/* Holographic scanner effect overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.05)_50%)] bg-[length:100%_4px] z-10 opacity-50"></div>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-cyan-500/10 via-transparent to-transparent z-10"></div>

            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <color attach="background" args={['#050505']} />

                {/* Ambient glow */}
                <fog attach="fog" args={['#050505', 5, 20]} />

                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
                <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={2} color="#00ffff" castShadow />

                <HologramPlane imageUrl={imageUrl} />
                <HoloBase />

                <OrbitControls
                    enableZoom={true}
                    enablePan={false}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.5}
                    maxDistance={10}
                    minDistance={3}
                    autoRotate
                    autoRotateSpeed={1}
                />

                <gridHelper args={[20, 20, 0x004444, 0x001111]} position={[0, -2.5, 0]} />
            </Canvas>

            <div className="absolute bottom-6 left-6 right-6 z-20 pointer-events-none flex flex-col items-center">
                <div className="bg-black/80 backdrop-blur-md border border-cyan-500/50 rounded-lg p-4 text-center shadow-[0_0_15px_rgba(0,255,255,0.3)] max-w-md w-full">
                    <div className="flex items-center justify-center gap-2 mb-2 text-cyan-400">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                        <p className="text-xs font-mono uppercase tracking-[0.2em] font-bold">Holographic Projection</p>
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                    </div>
                    <p className="text-white/90 text-sm font-medium truncate font-mono">{prompt}</p>
                </div>
            </div>
        </div>
    );
};
