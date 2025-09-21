import React, { Suspense, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, Box, Sphere, Cylinder, Text3D } from '@react-three/drei';
import { Construction, TrendingUp, Speed, Security } from '@mui/icons-material';
import { Box as MuiBox, Typography, Chip } from '@mui/material';

// Enhanced 3D Construction Scene
function ConstructionCrane() {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Base */}
      <Box args={[3, 0.5, 3]} position={[0, -0.25, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      
      {/* Main Tower */}
      <Box args={[0.3, 6, 0.3]} position={[0, 3, 0]}>
        <meshStandardMaterial color="#FFD700" />
      </Box>
      
      {/* Horizontal Arm */}
      <Box args={[4, 0.2, 0.2]} position={[2, 5.5, 0]}>
        <meshStandardMaterial color="#FFD700" />
      </Box>
      
      {/* Counterweight */}
      <Box args={[1, 1, 1]} position={[-1.5, 5, 0]}>
        <meshStandardMaterial color="#C0C0C0" />
      </Box>
      
      {/* Hook */}
      <Cylinder args={[0.1, 0.1, 2]} position={[3.5, 4, 0]}>
        <meshStandardMaterial color="#FF0000" />
      </Cylinder>
      
      {/* Building Foundation */}
      <Box args={[2, 0.3, 2]} position={[4, -0.15, 0]}>
        <meshStandardMaterial color="#696969" />
      </Box>
      
      {/* Building Structure */}
      <Box args={[1.5, 2, 1.5]} position={[4, 1, 0]}>
        <meshStandardMaterial color="#A9A9A9" />
      </Box>
    </group>
  );
}

function FloatingElements() {
  const elements = [
    { position: [2, 2, -2], color: '#3b82f6', type: 'box' },
    { position: [-2, 1, 2], color: '#22c55e', type: 'sphere' },
    { position: [0, 3, -3], color: '#f59e0b', type: 'cylinder' },
  ];

  return (
    <>
      {elements.map((element, index) => (
        <FloatingElement key={index} {...element} />
      ))}
    </>
  );
}

function FloatingElement({ position, color, type }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.5;
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

const ConstructionScene = () => {
  return (
    <div style={{ 
      position: 'absolute', 
      top: '50%', 
      right: '-2rem', 
      transform: 'translateY(-50%)', 
      width: '45vw', 
      height: '70vh',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 58, 138, 0.3) 100%)',
      border: '1px solid var(--border)'
    }}>
      <Canvas dpr={[1, 2]} camera={{ fov: 45, position: [10, 8, 10] }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[15, 15, 5]} intensity={1.2} />
          <pointLight position={[-15, -15, -15]} intensity={0.6} color="#3b82f6" />
          <pointLight position={[15, 15, 15]} intensity={0.4} color="#22c55e" />
          
          <ConstructionCrane />
          <FloatingElements />
          
          <OrbitControls 
            autoRotate 
            autoRotateSpeed={0.3}
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 8}
            maxPolarAngle={Math.PI / 2.2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};


function Home() {
  return (
    <div className="home-container">
      <ConstructionScene />
      <div className="home-content">
        <MuiBox display="flex" alignItems="center" gap={3} mb={4}>
          <Construction sx={{ fontSize: 56, color: 'var(--primary)' }} />
          <Typography variant="h1" sx={{
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            fontSize: '4.5rem',
            letterSpacing: '-0.02em',
            lineHeight: 1.1
          }}>
            Nirmaan AI
          </Typography>
        </MuiBox>
        
        <Typography variant="h4" className="subtitle" sx={{ 
          color: 'var(--text-light)', 
          mb: 5,
          lineHeight: 1.7,
          maxWidth: '650px',
          fontWeight: 400,
          fontSize: '1.4rem'
        }}>
          Building the future, one prediction at a time. We help you track your construction progress with cutting-edge AI and machine learning.
        </Typography>

        {/* Feature Cards with Enhanced UI */}
        <MuiBox className="features-grid" sx={{ mb: 6 }}>
          <MuiBox className="feature-card floating" sx={{ 
            background: 'var(--card)',
            borderRadius: '24px',
            padding: '3rem',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 32px var(--shadow)',
            position: 'relative',
            overflow: 'hidden',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <MuiBox sx={{ position: 'relative', flex: 1 }}>
              <MuiBox display="flex" alignItems="center" gap={3} mb={3}>
                <TrendingUp sx={{ fontSize: 40, color: 'var(--primary)' }} />
                <Typography variant="h3" sx={{ 
                  color: 'var(--text)', 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '2rem'
                }}>
                  Track Progress
                </Typography>
              </MuiBox>
              <Typography variant="h6" sx={{ 
                color: 'var(--text-light)', 
                mb: 4,
                lineHeight: 1.7,
                fontSize: '1.1rem',
                fontWeight: 400
              }}>
                Upload an image of your construction site and our AI will analyze the progress, giving you a clear picture of where things stand with real-time predictions.
              </Typography>
              <MuiBox sx={{ mt: 'auto' }}>
                <Link to="/predict" className="cta-button glow" style={{
                  display: 'inline-block',
                  padding: '16px 32px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}>
                  Track Now
                </Link>
              </MuiBox>
            </MuiBox>
          </MuiBox>

          <MuiBox className="feature-card floating" sx={{ 
            background: 'var(--card)',
            borderRadius: '24px',
            padding: '3rem',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 32px var(--shadow)',
            position: 'relative',
            overflow: 'hidden',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <MuiBox sx={{ position: 'relative', flex: 1 }}>
              <MuiBox display="flex" alignItems="center" gap={3} mb={3}>
                <Security sx={{ fontSize: 40, color: 'var(--success)' }} />
                <Typography variant="h3" sx={{ 
                  color: 'var(--text)', 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, var(--success), #22c55e)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '2rem'
                }}>
                  About Us
                </Typography>
              </MuiBox>
              <Typography variant="h6" sx={{ 
                color: 'var(--text-light)', 
                mb: 4,
                lineHeight: 1.7,
                fontSize: '1.1rem',
                fontWeight: 400
              }}>
                Learn about the team and technology behind Nirmaan AI and how we're revolutionizing the construction industry with AI-powered insights.
              </Typography>
              <MuiBox sx={{ mt: 'auto' }}>
                <Link to="/about" className="secondary-button" style={{
                  display: 'inline-block',
                  padding: '16px 32px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  borderRadius: '12px',
                  background: 'transparent',
                  color: 'var(--primary)',
                  border: '2px solid var(--primary)',
                  transition: 'all 0.3s ease'
                }}>
                  Meet the Team
                </Link>
              </MuiBox>
            </MuiBox>
          </MuiBox>
        </MuiBox>

        {/* Enhanced CTA Section */}
        <MuiBox className="cta-section" sx={{ 
          textAlign: 'center',
          background: 'var(--card)',
          borderRadius: '24px',
          padding: '4rem 3rem',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 32px var(--shadow)',
          position: 'relative',
          overflow: 'hidden',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <MuiBox sx={{ position: 'relative', zIndex: 2 }}>
            <Typography variant="h2" sx={{ 
              color: 'var(--text)', 
              fontWeight: 800,
              mb: 3,
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '2.5rem',
              letterSpacing: '-0.01em'
            }}>
              Ready to build smarter?
            </Typography>
            <Typography variant="h5" sx={{ 
              color: 'var(--text-light)', 
              mb: 5,
              fontWeight: 400,
              fontSize: '1.3rem',
              lineHeight: 1.6,
              maxWidth: '600px',
              margin: '0 auto 3rem auto'
            }}>
              Let's get your project on the fast track with AI-powered construction monitoring. 🚀
            </Typography>
            
            <MuiBox display="flex" gap={3} justifyContent="center" flexWrap="wrap">
              <Link to="/predict" className="cta-button glow" style={{ 
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                padding: '18px 36px',
                fontSize: '1.2rem',
                fontWeight: 700,
                textDecoration: 'none',
                color: 'white',
                borderRadius: '14px',
                transition: 'all 0.3s ease',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
                display: 'inline-block'
              }}>
                Start Tracking
              </Link>
              <Link to="/map" className="secondary-button" style={{ 
                padding: '18px 36px',
                fontSize: '1.2rem',
                fontWeight: 700,
                textDecoration: 'none',
                color: 'var(--primary)',
                border: '2px solid var(--primary)',
                borderRadius: '14px',
                background: 'transparent',
                transition: 'all 0.3s ease',
                display: 'inline-block'
              }}>
                View Projects Map
              </Link>
            </MuiBox>
          </MuiBox>
        </MuiBox>
      </div>
    </div>
  );
}

export default Home;