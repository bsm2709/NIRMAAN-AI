import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';

function Crane() {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 0.5, 2]} />
        <meshStandardMaterial color="#f7d794" />
      </mesh>
      <mesh position={[0, 4, 0]}>
        <boxGeometry args={[0.5, 8, 0.5]} />
        <meshStandardMaterial color="#e15f41" />
      </mesh>
      <mesh position={[0, 8, 0]}>
        <boxGeometry args={[8, 0.3, 0.3]} />
        <meshStandardMaterial color="#e15f41" />
      </mesh>
    </group>
  );
}

const ConstructionScene = () => {
  return (
    <div style={{ position: 'absolute', top: '50%', right: '0', transform: 'translateY(-50%)', width: '50vw', height: '50vh' }}>
      <Canvas dpr={[1, 2]} camera={{ fov: 45 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6}>
            <Crane />
          </Stage>
        </Suspense>
        <OrbitControls autoRotate />
      </Canvas>
    </div>
  );
};


function Home() {
  return (
    <div className="home-container">
      <ConstructionScene />
      <div className="home-content">
        <h1>🏗️ Welcome to Nirmaan AI! 🏗️</h1>
        <p className="subtitle">
          Building the future, one prediction at a time. We help you track your construction progress with cutting-edge AI.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <h3>Track Progress 📈</h3>
            <p>
              Upload an image of your construction site and our AI will analyze the progress, giving you a clear picture of where things stand.
            </p>
            <Link to="/predict" className="cta-button">Track Now</Link>
          </div>

          <div className="feature-card">
            <h3>About Us 👷‍♂️</h3>
            <p>
              Learn about the team and technology behind Nirmaan AI and how we're revolutionizing the construction industry.
            </p>
            <Link to="/about" className="secondary-button">Meet the Team</Link>
          </div>
        </div>

        <div className="cta-section">
          <h2>Ready to build smarter?</h2>
          <p>Let's get your project on the fast track. 🚀</p>
          <Link to="/predict" className="cta-button">Start Tracking</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;