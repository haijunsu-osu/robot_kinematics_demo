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

## Mathematical Background

### 1. Rotation Axis & Screw Theory

#### Rotation Axis from SO(3)
Given a $3 \times 3$ rotation matrix $R \in SO(3)$, the rotation angle $\theta$ and unit rotation axis $\hat{\omega}$ can be computed as:

1.  **Trace**: $\text{tr}(R) = 1 + 2\cos\theta$
    $$ \theta = \arccos\left(\frac{\text{tr}(R) - 1}{2}\right) $$
2.  **Axis**: If $\theta \neq 0$, the skew-symmetric matrix $[\hat{\omega}]$ is:
    $$ [\hat{\omega}] = \frac{1}{2\sin\theta}(R - R^T) $$
    The vector $\hat{\omega} = [\omega_x, \omega_y, \omega_z]^T$ is extracted from $[\hat{\omega}]$.

#### Screw Axis from SE(3)
Given a $4 \times 4$ homogeneous transformation matrix $T \in SE(3)$:
$$ T = \begin{bmatrix} R & p \\ 0 & 1 \end{bmatrix} $$

We extract the screw parameters (angle $\theta$, translation $d$, axis direction $s$, point on axis $c$):

1.  **Rotation**: Compute $\theta$ and axis $s$ (same as $\hat{\omega}$) from $R$ as above.
2.  **Translation $d$**: The translation along the screw axis is the projection of $p$ onto $s$:
    $$ d = p \cdot s $$
3.  **Point on Axis $c$**: A point on the screw axis can be found using:
    $$ c = \frac{1}{2} (p - d s) + \frac{1}{2} \cot\left(\frac{\theta}{2}\right) (s \times p) $$

### 2. Composition of Transformations

Given two transformations $T_1$ and $T_2$:

*   **Extrinsic (Fixed Frame)**: Transformations are applied relative to the fixed global frame. The order of multiplication is **reversed** (pre-multiplication):
    $$ T_{\text{final}} = T_2 \cdot T_1 $$
    (Apply $T_1$ then $T_2$ relative to world)

*   **Intrinsic (Moving Frame)**: Transformations are applied relative to the current moving frame. The order of multiplication is **forward** (post-multiplication):
    $$ T_{\text{final}} = T_1 \cdot T_2 $$
    (Apply $T_1$ then $T_2$ relative to frame 1)

### 3. DH Parameters & Forward Kinematics

The Denavit-Hartenberg (DH) convention defines the transformation between link $i-1$ and link $i$ using four parameters:

1.  **$a_{i-1}$ (Link Length)**: Distance from $Z_{i-1}$ to $Z_i$ along $X_{i-1}$.
2.  **$\alpha_{i-1}$ (Link Twist)**: Angle from $Z_{i-1}$ to $Z_i$ about $X_{i-1}$.
3.  **$d_i$ (Link Offset)**: Distance from $X_{i-1}$ to $X_i$ along $Z_i$.
4.  **$\theta_i$ (Joint Angle)**: Angle from $X_{i-1}$ to $X_i$ about $Z_i$.

The transformation matrix $T_{i-1}^{i}$ is computed as:

$$
T_{i-1}^{i} = \text{Rot}(x, \alpha_{i-1}) \cdot \text{Trans}(x, a_{i-1}) \cdot \text{Rot}(z, \theta_i) \cdot \text{Trans}(z, d_i)
$$

$$
T_{i-1}^{i} = \begin{bmatrix}
\cos\theta_i & -\sin\theta_i & 0 & a_{i-1} \\
\sin\theta_i \cos\alpha_{i-1} & \cos\theta_i \cos\alpha_{i-1} & -\sin\alpha_{i-1} & -d_i \sin\alpha_{i-1} \\
\sin\theta_i \sin\alpha_{i-1} & \cos\theta_i \sin\alpha_{i-1} & \cos\alpha_{i-1} & d_i \cos\alpha_{i-1} \\
0 & 0 & 0 & 1
\end{bmatrix}
$$
*(Note: Standard DH convention order may vary; this app uses the Proximal/Standard DH convention: Rot(x, alpha) -> Trans(x, a) -> Rot(z, theta) -> Trans(z, d))*

**Forward Kinematics**:
The pose of the end-effector relative to the base is the product of individual link transformations:
$$ T_{base}^{end} = T_0^1 \cdot T_1^2 \cdot \dots \cdot T_{n-1}^n $$

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
