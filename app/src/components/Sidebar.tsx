import React from 'react';
import { Box, Move3d, Layers, Activity } from 'lucide-react';
import styles from './Sidebar.module.css';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule }) => {
  const menuItems = [
    { id: 'rotations', label: '3D Rotations', icon: <Box size={20} /> },
    { id: 'transformations', label: 'Transformations', icon: <Move3d size={20} /> },
    { id: 'composition', label: 'Composition', icon: <Layers size={20} /> },
    { id: 'robot', label: 'Robot / DH', icon: <Activity size={20} /> },
  ];

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
    </div>
  );
};
