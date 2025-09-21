import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder, Text3D, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// 3D Construction Building
function ConstructionBuilding({ position = [0, 0, 0] }) {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Foundation */}
      <Box args={[4, 0.5, 4]} position={[0, -0.25, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      
      {/* Main Structure */}
      <Box args={[3, 3, 3]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#C0C0C0" />
      </Box>
      
      {/* Roof */}
      <Box args={[3.5, 0.3, 3.5]} position={[0, 3.15, 0]}>
        <meshStandardMaterial color="#2F4F4F" />
      </Box>
      
      {/* Construction Crane */}
      <Box args={[0.1, 4, 0.1]} position={[2, 2, 2]}>
        <meshStandardMaterial color="#FFD700" />
      </Box>
      
      {/* Crane Arm */}
      <Box args={[2, 0.1, 0.1]} position={[3, 3.5, 2]}>
        <meshStandardMaterial color="#FFD700" />
      </Box>
      
      {/* Windows */}
      <Box args={[0.1, 1, 1]} position={[1.51, 1.5, 0]}>
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
      </Box>
      <Box args={[0.1, 1, 1]} position={[-1.51, 1.5, 0]}>
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
      </Box>
    </group>
  );
}

// Floating Construction Materials
function ConstructionMaterials() {
  const materials = [
    { position: [2, 1, -2], color: '#8B4513', type: 'box' },
    { position: [-2, 0.5, 2], color: '#C0C0C0', type: 'box' },
    { position: [0, 2, -3], color: '#FFD700', type: 'cylinder' },
    { position: [-3, 1.5, 0], color: '#FF6347', type: 'sphere' },
  ];

  return (
    <>
      {materials.map((material, index) => (
        <FloatingMaterial key={index} {...material} />
      ))}
    </>
  );
}

function FloatingMaterial({ position, color, type }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  const geometry = type === 'box' ? 
    <Box args={[0.5, 0.5, 0.5]} /> :
    type === 'cylinder' ?
    <Cylinder args={[0.3, 0.3, 0.5]} /> :
    <Sphere args={[0.3]} />;

  return (
    <mesh ref={meshRef} position={position}>
      {geometry}
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Main Construction 3D Component
const Construction3D = ({ children, showControls = false }) => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* 3D Scene */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 1,
        background: 'linear-gradient(135deg, rgba(10, 14, 26, 0.8) 0%, rgba(30, 58, 138, 0.3) 100%)'
      }}>
        <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
          <pointLight position={[10, 10, 10]} intensity={0.3} color="#22c55e" />
          
          <ConstructionBuilding position={[0, 0, 0]} />
          <ConstructionMaterials />
          
          {showControls && <OrbitControls enableZoom={true} enablePan={true} />}
        </Canvas>
      </div>
      
      {/* Content Overlay */}
      <div style={{ 
        position: 'relative', 
        zIndex: 2, 
        width: '100%', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {children}
      </div>
    </div>
  );
};

export default Construction3D;
