import React from 'react';
import { Box, Move3d, Layers, Activity } from 'lucide-react';
import styles from './Sidebar.module.css';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule }) => {
  const menuItems = [
    {
      id: 'rotations',
      label: '3D Rotations',
      icon: <Box size={20} />,
      description: "Demonstrate bi-directional conversions between rotation representations: (1) Rotation Matrix R ∈ SO(3): Extract angle θ = arccos((tr(R)-1)/2) and axis ω from skew-symmetric [ω] = (R-Rᵀ)/(2sinθ). (2) Rodrigues' Formula: R = I + sinθ[ω] + (1-cosθ)[ω]². (3) Quaternions: q = (cosθ/2, ωsinθ/2) with ||q||=1. (4) Euler Angles: XYZ intrinsic/extrinsic rotations. All inputs synchronized in real-time with axis-angle visualization."
    },
    {
      id: 'transformations',
      label: 'Transformations',
      icon: <Move3d size={20} />,
      description: "SE(3) rigid body transformations T = [R|p; 0|1]. Screw Displacement: Any SE(3) motion decomposes as rotation θ about axis ŝ passing through point c, plus translation d along ŝ. Extract parameters: d = p·ŝ, c = ½(p - dŝ) + ½cot(θ/2)(ŝ×p). Construct: p = (I-R)c + dŝ where R = exp([ŝ]θ). Yellow axis visualizes screw line through c. Chasles' Theorem: every displacement is a screw motion."
    },
    {
      id: 'composition',
      label: 'Composition',
      icon: <Layers size={20} />,
      description: "Transformation composition T_final = T₁·T₂·...·Tₙ. Matrix multiplication order depends on reference frame: Extrinsic (Fixed/Space Frame): Apply transformations relative to world coordinates, reverse order T_final = Tₙ·...·T₂·T₁. Intrinsic (Moving/Body Frame): Apply relative to current frame, forward order T_final = T₁·T₂·...·Tₙ. Each step editable to visualize incremental pose changes. Non-commutativity: T₁T₂ ≠ T₂T₁ in general."
    },
    {
      id: 'robot',
      label: 'Robot / DH',
      icon: <Activity size={20} />,
      description: "Denavit-Hartenberg parameterization for serial robot kinematics. Each link i defined by 4 parameters: a (link length along x), α (link twist about x), d (link offset along z), θ (joint angle about z). Transformation: T^i_{i-1} = Rot_x(α)·Trans_x(a)·Rot_z(θ)·Trans_z(d). Forward Kinematics: T^n_0 = ∏ᵢT^i_{i-1} gives end-effector pose. Modify joint angles θᵢ (sliders) to move robot. Matrix shows final homogeneous transformation [R|p; 0|1]."
    },
  ];

  const activeItem = menuItems.find(item => item.id === activeModule);

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h2>KinematicsViz</h2>
      </div>
      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${activeModule === item.id ? styles.active : ''}`}
            onClick={() => setActiveModule(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {activeItem && (
        <div className={styles.description}>
          <h3>About {activeItem.label}</h3>
          <p>{activeItem.description}</p>
        </div>
      )}
    </div>
  );
};
