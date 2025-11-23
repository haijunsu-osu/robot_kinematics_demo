import { useState } from 'react';
import { Matrix4 } from 'three';
import { v4 as uuidv4 } from 'uuid';
import { Sidebar } from './components/Sidebar';
import './App.css';

import { RotationsModule } from './modules/Rotations/RotationsModule';
import { TransformationsModule } from './modules/Transformations/TransformationsModule';
import { CompositionModule } from './modules/Composition/CompositionModule';
import type { TransformStep } from './modules/Composition/CompositionModule';
import { RobotModule } from './modules/Robot/RobotModule';
import type { DHRow } from './utils/robotics';

function App() {
  const [activeModule, setActiveModule] = useState('rotations');

  // State for Rotations Module
  const [rotationMatrix, setRotationMatrix] = useState(new Matrix4());

  // State for Transformations Module
  const [transformMatrix, setTransformMatrix] = useState(new Matrix4());

  // State for Composition Module
  const [compositionSteps, setCompositionSteps] = useState<TransformStep[]>([]);
  const [compositionMode, setCompositionMode] = useState<'intrinsic' | 'extrinsic'>('intrinsic');

  // State for Robot Module (PUMA 560 Defaults)
  const [robotRows, setRobotRows] = useState<DHRow[]>([
    { id: uuidv4(), a: 0, alpha: Math.PI / 2, d: 0, theta: 0 },
    { id: uuidv4(), a: 0.4318, alpha: 0, d: 0, theta: 0 },
    { id: uuidv4(), a: 0.0203, alpha: -Math.PI / 2, d: 0.15005, theta: 0 },
    { id: uuidv4(), a: 0, alpha: Math.PI / 2, d: 0.4318, theta: 0 },
    { id: uuidv4(), a: 0, alpha: -Math.PI / 2, d: 0, theta: 0 },
    { id: uuidv4(), a: 0, alpha: 0, d: 0, theta: 0 },
  ]);
  const [robotAxisLength, setRobotAxisLength] = useState(0.3);

  const renderModule = () => {
    switch (activeModule) {
      case 'rotations':
        return <RotationsModule matrix={rotationMatrix} setMatrix={setRotationMatrix} />;
      case 'transformations':
        return <TransformationsModule matrix={transformMatrix} setMatrix={setTransformMatrix} />;
      case 'composition':
        return <CompositionModule
          steps={compositionSteps}
          setSteps={setCompositionSteps}
          mode={compositionMode}
          setMode={setCompositionMode}
        />;
      case 'robot':
        return <RobotModule
          rows={robotRows}
          setRows={setRobotRows}
          axisLength={robotAxisLength}
          setAxisLength={setRobotAxisLength}
        />;
      default:
        return <RotationsModule matrix={rotationMatrix} setMatrix={setRotationMatrix} />;
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh' }}>
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
      <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {renderModule()}
      </main>
    </div>
  );
}

export default App;
