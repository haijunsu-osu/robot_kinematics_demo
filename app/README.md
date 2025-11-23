# Kinematics Visualizer

A professional, educational web application for visualizing robot kinematics concepts. This tool is designed to help students and engineers understand 3D rotations, transformations, compositions, and robot kinematics through interactive 3D visualizations and dynamic mathematical inputs.

## Features

### 1. 3D Rotations
*   **Interactive Visualization**: Visualize a coordinate frame rotating in 3D space.
*   **Multiple Input Methods**:
    *   **Euler Angles**: Adjust X, Y, Z rotation angles via sliders.
    *   **Axis-Angle**: Specify a rotation axis vector and an angle.
    *   **Rotation Matrix**: Directly input values into a 3x3 rotation matrix.
*   **Real-time Updates**: All inputs are synchronized. Changing one updates the others and the 3D view instantly.
*   **Quaternion Display**: View the corresponding quaternion for the current rotation.

### 2. 3D Transformations
*   **Homogeneous Transformations**: Visualize rigid body transformations (rotation + translation).
*   **Screw Theory**:
    *   Define a screw axis (direction **s** and point **C**).
    *   Set screw parameters: Rotation angle ($\theta$) and translation along the axis ($d$).
    *   Visualize the screw axis (yellow line) and the resulting displacement.
*   **Matrix Control**: View and edit the full 4x4 homogeneous transformation matrix.

### 3. Composition
*   **Chain Transformations**: Create a sequence of transformations.
*   **Intrinsic vs. Extrinsic**: Toggle between Intrinsic (moving frame, post-multiply) and Extrinsic (fixed frame, pre-multiply) composition modes.
*   **Step-by-Step**: Add, remove, and reorder transformation steps to see how the order affects the final pose.

### 4. Robot / DH Parameters
*   **DH Table**: Define a robot manipulator using Denavit-Hartenberg (DH) parameters ($a$, $\alpha$, $d$, $\theta$).
*   **Kinematic Skeleton**: Visualizes the robot's links and joints based on the DH table.
*   **Coordinate Frames**: Displays coordinate frames attached to each joint.
*   **Customization**: Adjust the visual scale of the coordinate axes.

## Tech Stack

*   **Framework**: [React](https://reactjs.org/) (via [Vite](https://vitejs.dev/))
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **3D Graphics**: [Three.js](https://threejs.org/)
*   **React 3D Bindings**: [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) & [@react-three/drei](https://github.com/pmndrs/drei)
*   **Styling**: CSS Modules (Vanilla CSS)

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/haijunsu-osu/kinematics.git
    cd kinematics/app
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  **Open the app**:
    Navigate to `http://localhost:5173` in your browser.

## License

MIT
