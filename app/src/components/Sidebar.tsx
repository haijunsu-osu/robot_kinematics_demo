import React from 'react';
import { Box, Move3d, Layers, Activity } from 'lucide-react';
import { LatexText } from './LatexText';
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
      description: "Demonstrate bi-directional conversions between rotation representations:\n\n• Rotation Matrix $R \\in SO(3)$:\nExtract angle $\\theta = \\arccos((\\text{tr}(R)-1)/2)$ and axis $\\omega$ from skew-symmetric:\n$$[\\omega] = (R-R^T)/(2\\sin\\theta)$$\n\n• Rodrigues' Formula:\n$$R = I + \\sin\\theta[\\omega] + (1-\\cos\\theta)[\\omega]^2$$\n\n• Quaternions:\n$$q = (\\cos(\\theta/2), \\omega\\sin(\\theta/2))$$\nwith $||q||=1$.\n\n• Euler Angles:\nXYZ intrinsic/extrinsic rotations. All inputs synchronized in real-time with axis-angle visualization."
    },
    {
      id: 'transformations',
      label: 'Transformations',
      icon: <Move3d size={20} />,
      description: "SE(3) rigid body transformations:\n$$T = [R|p; 0|1]$$\n\nScrew Displacement:\nAny SE(3) motion decomposes as rotation $\\theta$ about axis $\\hat{s}$ passing through point $c$, plus translation $d$ along $\\hat{s}$.\n\n• Extract parameters:\n$$d = p\\cdot\\hat{s}$$\n$$c = \\frac{1}{2}(p - d\\hat{s}) + \\frac{1}{2}\\cot(\\theta/2)(\\hat{s}\\times p)$$\n\n• Construct:\n$$p = (I-R)c + d\\hat{s}$$\nwhere $R = \\exp([\\hat{s}]\\theta)$.\n\nYellow axis visualizes screw line through $c$. Chasles' Theorem: every displacement is a screw motion."
    },
    {
      id: 'composition',
      label: 'Composition',
      icon: <Layers size={20} />,
      description: "Transformation composition:\n$$T_{final} = T_1 \\cdot T_2 \\cdot ... \\cdot T_n$$\n\nMatrix multiplication order depends on reference frame:\n\n• Extrinsic (Fixed/Space Frame):\nApply transformations relative to world coordinates, reverse order:\n$$T_{final} = T_n \\cdot ... \\cdot T_2 \\cdot T_1$$\n\n• Intrinsic (Moving/Body Frame):\nApply relative to current frame, forward order:\n$$T_{final} = T_1 \\cdot T_2 \\cdot ... \\cdot T_n$$\n\nEach step editable to visualize incremental pose changes. Non-commutativity: $T_1 T_2 \\neq T_2 T_1$ in general."
    },
    {
      id: 'robot',
      label: 'Robot / DH',
      icon: <Activity size={20} />,
      description: "Denavit-Hartenberg parameterization for serial robot kinematics. Each link $i$ defined by 4 parameters:\n• $a$ (link length along $x$)\n• $\\alpha$ (link twist about $x$)\n• $d$ (link offset along $z$)\n• $\\theta$ (joint angle about $z$)\n\nTransformation:\n$$T^i_{i-1} = Rot_x(\\alpha) \\cdot Trans_x(a) \\cdot Rot_z(\\theta) \\cdot Trans_z(d)$$\n\nForward Kinematics:\n$$T^n_0 = \\prod_i T^i_{i-1}$$\ngives end-effector pose.\n\nOptionally add a Tool Frame defined by translation and rotation relative to the last joint frame.\n\nFinal pose:\n$$T_{tool} = T^n_0 \\cdot T_{tool\\_rel}$$\n\nModify joint angles $\\theta_i$ (sliders) to move robot. Matrix shows final homogeneous transformation $[R|p; 0|1]$."
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
          <p><LatexText text={activeItem.description} /></p>
        </div>
      )}
    </div>
  );
};
