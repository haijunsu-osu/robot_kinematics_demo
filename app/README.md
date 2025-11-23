# Robot Kinematics Demo

A professional, educational web application for visualizing robot kinematics concepts. This tool is designed to help students and engineers understand 3D rotations, transformations, compositions, and robot kinematics through interactive 3D visualizations and dynamic mathematical inputs.

## Features

### 1. 3D Rotations
*   **Interactive Visualization**: Visualize a coordinate frame rotating in 3D space.
*   **Multiple Input Methods**:
    *   **Euler Angles**: Adjust X, Y, Z rotation angles via sliders.
    *   **Axis-Angle**: Specify a rotation axis vector and an angle.
    *   **Rotation Matrix**: Directly input values into a 3x3 rotation matrix.
    *   **Matrix Copy/Paste**: Copy the current matrix in a standard format or paste matrices from other tools (supports space, comma, semicolon, and Mathematica-style `{}` delimiters).
*   **Screw Theory Analysis**: Automatically computes and displays the screw axis, rotation angle, and displacement for any given rotation.
*   **Real-time Updates**: All inputs are synchronized. Changing one updates the others and the 3D view instantly.
*   **Quaternion Display**: View the corresponding quaternion for the current rotation.

### 2. 3D Transformations
*   **Homogeneous Transformations**: Visualize rigid body transformations (rotation + translation).
*   **Screw Theory**:
    *   Define a screw axis (direction **s** and point **C**).
    *   Set screw parameters: Rotation angle ($\theta$) and translation along the axis ($d$).
    *   Visualize the screw axis (yellow line) and the resulting displacement.
*   **Matrix Control**: View and edit the full 4x4 homogeneous transformation matrix.
*   **Advanced Matrix Input**: Copy the 4x4 matrix or paste one to instantly update the visualization and extract screw parameters.

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

This section provides detailed mathematical formulas for converting between different rotation and transformation representations used throughout the application.

---

### 1. Rotation Representations (SO(3))

#### 1.1 Rotation Matrix to Axis-Angle

Given a $3 \times 3$ rotation matrix $R \in SO(3)$, we extract the rotation angle $\theta$ and unit axis $\hat{\omega}$:

**Step 1: Compute the rotation angle**
$$
\theta = \arccos\left(\frac{\text{tr}(R) - 1}{2}\right)
$$

where $\text{tr}(R) = R_{11} + R_{22} + R_{33}$ is the trace of $R$.

**Step 2: Compute the rotation axis**

For $\theta \neq 0$:
$$
[\hat{\omega}] = \frac{1}{2\sin\theta}(R - R^T)
$$

The skew-symmetric matrix $[\hat{\omega}]$ has the form:
$$
[\hat{\omega}] = \begin{bmatrix}
0 & -\omega_z & \omega_y \\
\omega_z & 0 & -\omega_x \\
-\omega_y & \omega_x & 0
\end{bmatrix}
$$

Extract the axis vector: $\hat{\omega} = [\omega_x, \omega_y, \omega_z]^T$

**Special Case**: If $\theta = 0$, then $R = I$ (identity), and any axis is valid.

**Special Case**: If $\theta = \pi$, the formula above is undefined. Instead, find the eigenvector of $R$ corresponding to eigenvalue $1$:
$$
\hat{\omega} = \frac{1}{\sqrt{2(1 + R_{ii})}} \begin{bmatrix} R_{1i} + R_{i1} \\ R_{2i} + R_{i2} \\ R_{3i} + R_{i3} \end{bmatrix}
$$
where $i$ is the index of the largest diagonal element of $R$.

---

#### 1.2 Axis-Angle to Rotation Matrix (Rodrigues' Formula)

Given a unit axis $\hat{\omega} = [\omega_x, \omega_y, \omega_z]^T$ and angle $\theta$, the rotation matrix is:

$$
R = I + \sin\theta \, [\hat{\omega}] + (1 - \cos\theta) \, [\hat{\omega}]^2
$$

where:
- $I$ is the $3 \times 3$ identity matrix
- $[\hat{\omega}]$ is the skew-symmetric matrix of $\hat{\omega}$
- $[\hat{\omega}]^2 = \hat{\omega}\hat{\omega}^T - I$

**Expanded form**:
$$
R = \begin{bmatrix}
\cos\theta + \omega_x^2(1-\cos\theta) & \omega_x\omega_y(1-\cos\theta) - \omega_z\sin\theta & \omega_x\omega_z(1-\cos\theta) + \omega_y\sin\theta \\
\omega_x\omega_y(1-\cos\theta) + \omega_z\sin\theta & \cos\theta + \omega_y^2(1-\cos\theta) & \omega_y\omega_z(1-\cos\theta) - \omega_x\sin\theta \\
\omega_x\omega_z(1-\cos\theta) - \omega_y\sin\theta & \omega_y\omega_z(1-\cos\theta) + \omega_x\sin\theta & \cos\theta + \omega_z^2(1-\cos\theta)
\end{bmatrix}
$$

---

#### 1.3 Quaternion Representation

A unit quaternion $q = (w, x, y, z)$ represents a rotation, where $w^2 + x^2 + y^2 + z^2 = 1$.

**Rotation Matrix to Quaternion**:
$$
w = \frac{1}{2}\sqrt{1 + \text{tr}(R)}
$$
$$
\begin{bmatrix} x \\ y \\ z \end{bmatrix} = \frac{1}{4w} \begin{bmatrix} R_{32} - R_{23} \\ R_{13} - R_{31} \\ R_{21} - R_{12} \end{bmatrix}
$$

**Quaternion to Rotation Matrix**:
$$
R = \begin{bmatrix}
1-2(y^2+z^2) & 2(xy-wz) & 2(xz+wy) \\
2(xy+wz) & 1-2(x^2+z^2) & 2(yz-wx) \\
2(xz-wy) & 2(yz+wx) & 1-2(x^2+y^2)
\end{bmatrix}
$$

**Axis-Angle to Quaternion**:
$$
q = \left(\cos\frac{\theta}{2}, \, \omega_x\sin\frac{\theta}{2}, \, \omega_y\sin\frac{\theta}{2}, \, \omega_z\sin\frac{\theta}{2}\right)
$$

**Quaternion to Axis-Angle**:
$$
\theta = 2\arccos(w)
$$
$$
\hat{\omega} = \frac{1}{\sin(\theta/2)} \begin{bmatrix} x \\ y \\ z \end{bmatrix}
$$

---

### 2. Homogeneous Transformations (SE(3))

#### 2.1 Structure of SE(3) Matrices

A homogeneous transformation matrix $T \in SE(3)$ has the form:
$$
T = \begin{bmatrix} R & p \\ 0 & 1 \end{bmatrix}
$$

where:
- $R \in SO(3)$ is the $3 \times 3$ rotation matrix
- $p = [p_x, p_y, p_z]^T$ is the translation vector
- The bottom row is $[0, 0, 0, 1]$

**Interpretation**: $T$ transforms a point from the local frame to the global frame:
$$
p_{\text{global}} = R \, p_{\text{local}} + p
$$

---

#### 2.2 Screw Theory: Matrix to Screw Parameters

Given $T \in SE(3)$, we extract the screw parameters $(s, c, \theta, d)$:

**Step 1: Extract rotation parameters**
From the rotation part $R$, compute $\theta$ and axis $s$ using the axis-angle formulas above.

**Step 2: Compute translation along screw axis**
$$
d = p \cdot s
$$

where $p$ is the translation vector from $T$.

**Step 3: Compute point on screw axis**

For $\theta \neq 0$ (general screw motion):
$$
c = \frac{1}{2}(p - ds) + \frac{1}{2}\cot\left(\frac{\theta}{2}\right)(s \times p)
$$

For $\theta = 0$ (pure translation):
$$
s = \frac{p}{\|p\|}, \quad d = \|p\|, \quad c = \mathbf{0}
$$

**Geometric Interpretation**:
- $s$: Direction of the screw axis
- $c$: A point on the screw axis
- $\theta$: Rotation angle about the screw axis
- $d$: Translation along the screw axis

The screw axis is the line $\{c + \lambda s \mid \lambda \in \mathbb{R}\}$.

---

#### 2.3 Screw Parameters to Matrix

Given screw parameters $(s, c, \theta, d)$, construct $T$:

**Step 1: Compute rotation matrix**
$$
R = I + \sin\theta \, [s] + (1-\cos\theta) \, [s]^2
$$

**Step 2: Compute translation vector**
$$
p = (I - R)c + ds
$$

**Step 3: Assemble transformation matrix**
$$
T = \begin{bmatrix} R & p \\ 0 & 1 \end{bmatrix}
$$

**Derivation**: The formula $p = (I - R)c + ds$ comes from the requirement that point $c$ on the screw axis rotates to $Rc$ and then translates by $ds$ along the axis, resulting in net displacement:
$$
p = c - Rc + ds = (I - R)c + ds
$$

---

### 3. Composition of Transformations

Given two transformations $T_1$ and $T_2$:

**Extrinsic (Fixed Frame)**:
Transformations are applied relative to the fixed global frame. To apply $T_1$ first, then $T_2$:
$$
T_{\text{final}} = T_2 \cdot T_1
$$

**Example**: Rotate 90° about world $z$, then translate 1 unit along world $x$:
$$
T = \text{Trans}(x,1) \cdot \text{Rot}(z, 90°)
$$

**Intrinsic (Moving Frame)**:
Transformations are applied relative to the current moving frame. To apply $T_1$ first, then $T_2$:
$$
T_{\text{final}} = T_1 \cdot T_2
$$

**Example**: Rotate 90° about body $z$, then translate 1 unit along body $x$:
$$
T = \text{Rot}(z, 90°) \cdot \text{Trans}(x, 1)
$$

**Key Difference**: The order of matrix multiplication is reversed between the two conventions.

---

### 4. Denavit-Hartenberg (DH) Parameters

#### 4.1 DH Parameter Definitions

The DH convention uses four parameters to describe each joint/link:

| Parameter | Symbol | Description |
|-----------|---------|-------------|
| Link Length | $a_{i-1}$ | Distance from $Z_{i-1}$ to $Z_i$ along $X_{i-1}$ |
| Link Twist | $\alpha_{i-1}$ | Angle from $Z_{i-1}$ to $Z_i$ about $X_{i-1}$ |
| Link Offset | $d_i$ | Distance from $X_{i-1}$ to $X_i$ along $Z_i$ |
| Joint Angle | $\theta_i$ | Angle from $X_{i-1}$ to $X_i$ about $Z_i$ |

**Convention**: For revolute joints, $\theta_i$ is the variable. For prismatic joints, $d_i$ is the variable.

---

#### 4.2 DH Transformation Matrix

The transformation from frame $i-1$ to frame $i$ is:
$$
T_{i-1}^{i} = \text{Rot}_x(\alpha_{i-1}) \cdot \text{Trans}_x(a_{i-1}) \cdot \text{Rot}_z(\theta_i) \cdot \text{Trans}_z(d_i)
$$

**Explicit Matrix Form**:
$$
T_{i-1}^{i} = \begin{bmatrix}
\cos\theta_i & -\sin\theta_i \cos\alpha_{i-1} & \sin\theta_i \sin\alpha_{i-1} & a_{i-1}\cos\theta_i \\
\sin\theta_i & \cos\theta_i \cos\alpha_{i-1} & -\cos\theta_i \sin\alpha_{i-1} & a_{i-1}\sin\theta_i \\
0 & \sin\alpha_{i-1} & \cos\alpha_{i-1} & d_i \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

---

#### 4.3 Forward Kinematics

The pose of the end-effector (frame $n$) relative to the base (frame $0$) is:
$$
T_0^n = T_0^1 \cdot T_1^2 \cdot T_2^3 \cdots T_{n-1}^n
$$

Each $T_{i-1}^i$ is computed from the DH parameters of joint $i$.

**Example: 3-DOF Planar Arm**

| Joint | $a$ | $\alpha$ | $d$ | $\theta$ |
|-------|-----|----------|-----|----------|
| 1 | $L_1$ | 0 | 0 | $\theta_1$ |
| 2 | $L_2$ | 0 | 0 | $\theta_2$ |
| 3 | $L_3$ | 0 | 0 | $\theta_3$ |

The end-effector position is:
$$
\begin{bmatrix} x \\ y \end{bmatrix} = \begin{bmatrix}
L_1\cos\theta_1 + L_2\cos(\theta_1+\theta_2) + L_3\cos(\theta_1+\theta_2+\theta_3) \\
L_1\sin\theta_1 + L_2\sin(\theta_1+\theta_2) + L_3\sin(\theta_1+\theta_2+\theta_3)
\end{bmatrix}
$$

---

### 5. Module-Specific Conversions

#### 5.1 3D Rotations Module
This module demonstrates **bi-directional conversion** between:
- **Euler Angles** ↔ **Rotation Matrix**
- **Axis-Angle** ↔ **Rotation Matrix**
- **Quaternion** ↔ **Rotation Matrix**

All representations are kept synchronized in real-time.

#### 5.2 3D Transformations Module
This module extends rotations to include translation:
- **Position + Euler Angles** ↔ **4×4 Matrix**
- **Screw Parameters** ($s, c, \theta, d$) ↔ **4×4 Matrix**

The screw axis visualization shows the geometric interpretation of the transformation.

#### 5.3 Composition Module
Demonstrates how transformation order affects the result:
- **Extrinsic**: World-frame operations (pre-multiply)
- **Intrinsic**: Body-frame operations (post-multiply)

Each step can be edited to see incremental effects on the final pose.

#### 5.4 Robot / DH Module
Shows the complete kinematic chain:
- DH table defines each joint
- Joint angles control robot configuration
- Forward kinematics matrix shows end-effector pose
- Coordinate frames visualize each link's local frame

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
