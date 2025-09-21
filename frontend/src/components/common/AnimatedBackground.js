import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Animated floating spheres
function FloatingSphere({ position, color, speed = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.5;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <Sphere ref={meshRef} position={position} args={[1, 32, 32]}>
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={0.3}
        speed={2}
        roughness={0.1}
        metalness={0.8}
      />
    </Sphere>
  );
}

// Construction-themed 3D elements
function ConstructionElements() {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Floating construction elements */}
      <FloatingSphere position={[-3, 2, -2]} color="#3b82f6" speed={0.8} />
      <FloatingSphere position={[3, -1, -3]} color="#22c55e" speed={1.2} />
      <FloatingSphere position={[0, 3, -4]} color="#f59e0b" speed={0.6} />
      <FloatingSphere position={[-2, -2, -1]} color="#ef4444" speed={1.0} />
      <FloatingSphere position={[2, 1, -5]} color="#8b5cf6" speed={0.9} />
    </group>
  );
}

// Main animated background component
const AnimatedBackground = ({ children, intensity = 0.1 }) => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* 3D Background */}
      <div 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: -1,
          opacity: intensity
        }}
      >
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <ConstructionElements />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground;
