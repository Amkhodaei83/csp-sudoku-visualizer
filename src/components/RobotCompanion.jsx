import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, RoundedBox, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// --- THEME-FRIENDLY CONFIG ---
const ROBOT_MAIN = "#e2e8f0";    
const ROBOT_ACCENT = "#94a3b8";  
const ROBOT_JOINTS = "#475569";  
const SCREEN_BG = "#0f172a";     

// --- EXPRESSIVE EYES ---
const RobotEyes = ({ expression, color }) => {
    const [blink, setBlink] = useState(false);
    useEffect(() => {
        const loop = setInterval(() => {
            setBlink(true);
            setTimeout(() => setBlink(false), 150);
        }, 2000 + Math.random() * 3000);
        return () => clearInterval(loop);
    }, []);

    const EyeBar = ({ position, rotation, scale = [1, 1, 1] }) => (
        <mesh position={position} rotation={rotation} scale={scale}>
            <planeGeometry args={[0.12, 0.04]} />
            <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
    );

    if (blink && expression !== 'sleeping' && expression !== 'won') {
        return (
            <group>
                <EyeBar position={[-0.2, 0, 0.01]} />
                <EyeBar position={[0.2, 0, 0.01]} />
            </group>
        );
    }

    switch (expression) {
        case 'happy': 
        case 'smart': 
            return (
                <group>
                    {/* Left Eye: A simple horizontal bar (-) */}
                    <EyeBar position={[-0.2, 0, 0.01]} />

                    {/* Right Eye: Two bars angled to form (^) */}
                    <EyeBar position={[0.15, 0.04, 0.01]} rotation={[0, 0, 0.5]} />
                    <EyeBar position={[0.25, 0.04, 0.01]} rotation={[0, 0, -0.5]} />
                </group>
            );
        case 'sad': 
            return (
                <group>
                    <EyeBar position={[-0.2, 0, 0.01]} rotation={[0, 0, -0.3]} scale={[1.5, 1, 1]} />
                    <EyeBar position={[0.2, 0, 0.01]} rotation={[0, 0, 0.3]} scale={[1.5, 1, 1]} />
                </group>
            );
        case 'angry': 
            return (
                <group>
                    <EyeBar position={[-0.2, 0.05, 0.01]} rotation={[0, 0, 0.4]} scale={[1.5, 1, 1]} />
                    <EyeBar position={[0.2, 0.05, 0.01]} rotation={[0, 0, -0.4]} scale={[1.5, 1, 1]} />
                </group>
            );
        case 'confused': 
            return (
                <group>
                    <mesh position={[-0.2, 0, 0.01]}>
                        <planeGeometry args={[0.12, 0.12]} />
                        <meshBasicMaterial color={color} toneMapped={false} />
                    </mesh>
                    <EyeBar position={[0.2, 0, 0.01]} />
                </group>
            );
        case 'surprised': 
             return (
                <group>
                    <mesh position={[-0.2, 0, 0.01]}>
                        <planeGeometry args={[0.15, 0.15]} />
                        <meshBasicMaterial color={color} toneMapped={false} />
                    </mesh>
                    <mesh position={[0.2, 0, 0.01]}>
                        <planeGeometry args={[0.15, 0.15]} />
                        <meshBasicMaterial color={color} toneMapped={false} />
                    </mesh>
                </group>
            );
        case 'sleeping': 
             return (
                <group>
                    <EyeBar position={[-0.2, -0.05, 0.01]} />
                    <EyeBar position={[0.2, -0.05, 0.01]} />
                </group>
            );
        default: 
            return (
                <group>
                    <mesh position={[-0.2, 0, 0.01]}><planeGeometry args={[0.12, 0.15]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh>
                    <mesh position={[0.2, 0, 0.01]}><planeGeometry args={[0.12, 0.15]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh>
                </group>
            );
    }
};

// --- ROBOT MODEL ---
const Robot = ({ status, speed = 50 }) => {
    const group = useRef();
    const head = useRef();
    const leftArm = useRef();
    const rightArm = useRef();

    const mousePos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (event) => {
            const x = (event.clientX / window.innerWidth) * 2 - 1;
            const y = -(event.clientY / window.innerHeight) * 2 + 1;
            mousePos.current = { x, y };
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const [isPoked, setIsPoked] = useState(false);
    
    const handlePointerDown = (e) => {
        e.stopPropagation();
        setIsPoked(true);
        setTimeout(() => setIsPoked(false), 1500);
    };
    
    const isWin = status === 'won';
    const isLoss = status === 'lost';
    const isConfused = status === 'confused';
    const isFrustrated = status === 'frustrated'; 
    const isSurprised = status === 'surprised';
    const isSmart = status === 'smart'; 
    const isIdle = status === 'idle' || status === 'sleeping';
    const isThinking = status === 'thinking';

    const speedFactor = Math.min(Math.max(speed / 100, 0.1), 1.5);

    let faceColor = "#00ffcc"; 
    let expression = "neutral";
    
    if (isWin) { faceColor = "#ffff00"; expression = "happy"; }
    else if (isLoss) { faceColor = "#ff0000"; expression = "sad"; }
    else if (isFrustrated) { faceColor = "#ff3300"; expression = "angry"; }
    else if (isConfused) { faceColor = "#ff00ff"; expression = "confused"; }
    else if (isSurprised) { faceColor = "#00ffff"; expression = "surprised"; }
    else if (isSmart) { faceColor = "#00ff00"; expression = "smart"; }
    else if (isIdle) { faceColor = "#444"; expression = "sleeping"; }

    if (isPoked) {
        faceColor = "#ff0000";
        expression = "angry";
    }

    useFrame((state) => {
        if(!group.current) return;
        const t = state.clock.getElapsedTime();

        const hoverFreq = (isFrustrated || isThinking || isPoked) ? 2 + (speedFactor * 10) : 1.5;
        const hoverAmp = isFrustrated || isPoked ? 0.05 : 0.1;
        group.current.position.y = THREE.MathUtils.lerp(
            group.current.position.y, 
            -0.5 + Math.sin(t * hoverFreq) * hoverAmp, 
            0.1
        );

        // --- MIRRORED LOOK LOGIC ---
        // Base hy offset (0.3) makes the robot face toward the right (the board) by default
        let hx=0, hy=0.3, hz=0; 
        const targetLookX = mousePos.current.x * 0.3; 
        const targetLookY = -mousePos.current.y * 0.3;

        if (isThinking) { 
            hy += Math.sin(t * (1 + speedFactor * 2)) * 0.2; 
            hx = -0.1 + Math.sin(t * 5 * speedFactor) * 0.05; 
        }
        else if (isSurprised) { hx = 0.2; hz = Math.sin(t * 30) * 0.05; }
        else if (isSmart) { hz = 0.2; hy += 0.1; } // Flipped Z tilt
        else if (isIdle) { hx = 0.3; hy += Math.sin(t * 0.5) * 0.05; }
        else if (isWin) { hz = Math.sin(t * 5) * 0.2; hx = -0.1 + Math.sin(t * 10) * 0.1; }

        if (!isPoked) {
            hy += targetLookX;
            hx += targetLookY; 
        } else {
            hy += Math.sin(t * 20) * 0.1; 
        }

        head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, hx, 0.1);
        head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, hy, 0.1);
        head.current.rotation.z = THREE.MathUtils.lerp(head.current.rotation.z, hz, 0.1);

        let lx=0, lz=0, ly=0.6;
        let rx=0, rz=0, ry=0.6;
        if (isThinking) {
            const typeSpeed = 5 + (speedFactor * 25); 
            rx = -1.5; lx = -1.5; rz = -0.2; lz = 0.2;
            ry = 0.6 + Math.sin(t * typeSpeed) * 0.05;
            ly = 0.6 + Math.cos(t * typeSpeed) * 0.05;
        } 
        else if (isWin) {
            lz = 2.5 + Math.cos(t * 8) * 0.5; rz = -2.5 - Math.sin(t * 8) * 0.5;
            ly = 0.8 + Math.sin(t * 10) * 0.2; ry = 0.8 + Math.cos(t * 10) * 0.2;
        }
        else if (isSurprised || isPoked) { lx = -2.5; rx = -2.5; lz = 0.5; rz = -0.5; ly = 1.0; ry = 1.0; }
        else if (isIdle) { lz = 0.1; rz = -0.1; }

        leftArm.current.rotation.x = THREE.MathUtils.lerp(leftArm.current.rotation.x, lx, 0.1);
        leftArm.current.rotation.z = THREE.MathUtils.lerp(leftArm.current.rotation.z, lz, 0.1);
        leftArm.current.position.y = THREE.MathUtils.lerp(leftArm.current.position.y, ly, 0.1);
        rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x, rx, 0.1);
        rightArm.current.rotation.z = THREE.MathUtils.lerp(rightArm.current.rotation.z, rz, 0.1);
        rightArm.current.position.y = THREE.MathUtils.lerp(rightArm.current.position.y, ry, 0.1);
    });

    return (
        <group ref={group} position={[0, -1, 0]} onClick={handlePointerDown}>
             {isWin && <Sparkles count={40} scale={4} size={5} speed={0.4} opacity={0.5} color="#ffff00" />}
             
             {/* HEAD */}
             <group ref={head} position={[0, 1.5, 0]}>
                 <RoundedBox args={[0.85, 0.65, 0.6]} radius={0.05} smoothness={4}>
                    <meshStandardMaterial color={ROBOT_MAIN} roughness={0.1} metalness={0.6} />
                 </RoundedBox>
                 {/* Face Screen */}
                 <mesh position={[0, 0, 0.31]}>
                    <planeGeometry args={[0.75, 0.5]} />
                    <meshBasicMaterial color={SCREEN_BG} />
                 </mesh>
                 <group position={[0, 0, 0.32]}>
                    <RobotEyes expression={expression} color={faceColor} />
                    <pointLight distance={1} intensity={2} color={faceColor} />
                 </group>
                 {/* Ears */}
                 <mesh position={[0.43, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                    <cylinderGeometry args={[0.12, 0.12, 0.05, 16]} />
                    <meshStandardMaterial color={ROBOT_JOINTS} />
                 </mesh>
                 <mesh position={[-0.43, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                    <cylinderGeometry args={[0.12, 0.12, 0.05, 16]} />
                    <meshStandardMaterial color={ROBOT_JOINTS} />
                 </mesh>
                 {/* ANTENNA (Mirrored to the left side) */}
                 <mesh position={[-0.2, 0.35, 0]}>
                    <cylinderGeometry args={[0.01, 0.01, 0.4]} />
                    <meshStandardMaterial color={ROBOT_ACCENT} />
                 </mesh>
                 <mesh position={[-0.2, 0.55, 0]}>
                    <sphereGeometry args={[0.05]} />
                    <meshBasicMaterial color={(isLoss || isPoked) ? "#333" : "red"} />
                 </mesh>
             </group>

             {/* BODY */}
             <group position={[0, 0.6, 0]}>
                 <RoundedBox args={[0.6, 0.8, 0.4]} radius={0.05} smoothness={4}>
                    <meshStandardMaterial color={ROBOT_MAIN} roughness={0.1} metalness={0.6} />
                 </RoundedBox>
                 <mesh position={[0, 0.15, 0.21]}>
                    <boxGeometry args={[0.4, 0.15, 0.02]} />
                    <meshStandardMaterial color={ROBOT_JOINTS} />
                 </mesh>
             </group>

             {/* ARMS */}
             <group ref={leftArm} position={[-0.38, 0.85, 0]}>
                 <mesh><sphereGeometry args={[0.1]} /><meshStandardMaterial color={ROBOT_JOINTS} /></mesh>
                 <mesh position={[-0.05, -0.3, 0]}>
                    <RoundedBox args={[0.12, 0.6, 0.12]} radius={0.02} smoothness={4}>
                        <meshStandardMaterial color={ROBOT_ACCENT} roughness={0.3} metalness={0.8} />
                    </RoundedBox>
                 </mesh>
                 <mesh position={[-0.05, -0.65, 0]}><sphereGeometry args={[0.12]} /><meshStandardMaterial color={ROBOT_JOINTS} /></mesh>
             </group>
             <group ref={rightArm} position={[0.38, 0.85, 0]}>
                 <mesh><sphereGeometry args={[0.1]} /><meshStandardMaterial color={ROBOT_JOINTS} /></mesh>
                  <mesh position={[0.05, -0.3, 0]}>
                    <RoundedBox args={[0.12, 0.6, 0.12]} radius={0.02} smoothness={4}>
                        <meshStandardMaterial color={ROBOT_ACCENT} roughness={0.3} metalness={0.8} />
                    </RoundedBox>
                  </mesh>
                  <mesh position={[0.05, -0.65, 0]}><sphereGeometry args={[0.12]} /><meshStandardMaterial color={ROBOT_JOINTS} /></mesh>
             </group>

             {/* LEGS */}
             <group position={[-0.2, 0, 0]}>
                <RoundedBox args={[0.15, 0.5, 0.15]} radius={0.02} smoothness={4} position={[0, -0.25, 0]}>
                    <meshStandardMaterial color={ROBOT_ACCENT} roughness={0.3} metalness={0.8} />
                </RoundedBox>
             </group>
             <group position={[0.2, 0, 0]}>
                <RoundedBox args={[0.15, 0.5, 0.15]} radius={0.02} smoothness={4} position={[0, -0.25, 0]}>
                    <meshStandardMaterial color={ROBOT_ACCENT} roughness={0.3} metalness={0.8} />
                </RoundedBox>
             </group>
        </group>
    );
};

const RobotCompanion = ({ status, speed }) => {
     return (
        <div style={{ 
            width: '100%', 
            height: '350px', 
            position: 'relative',
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            marginBottom: '10px',
            overflow: 'visible' 
        }}>
            <Canvas 
                style={{ pointerEvents: 'auto', width: '100%', height: '100%' }}
                camera={{ position: [0, 1.0, 4.2], fov: 45 }} 
            >
                <ambientLight intensity={1.2} />
                <directionalLight position={[2, 5, 2]} intensity={2} />
                
                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4} floatingRange={[-0.05, 0.05]}>
                    <Robot status={status} speed={speed} />
                </Float>
                

            </Canvas>
        </div>
    );
};

export default RobotCompanion;