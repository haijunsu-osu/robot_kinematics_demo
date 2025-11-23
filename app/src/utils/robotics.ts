import { Matrix4, Vector3, Quaternion } from 'three';

export interface DHRow {
    id: string;
    a: number;      // Link length
    alpha: number;  // Link twist (rad)
    d: number;      // Link offset
    theta: number;  // Joint angle (rad)
}

export const calculateDHMatrix = (a: number, alpha: number, d: number, theta: number): Matrix4 => {
    const cTh = Math.cos(theta);
    const sTh = Math.sin(theta);
    const cAl = Math.cos(alpha);
    const sAl = Math.sin(alpha);

    return new Matrix4().set(
        cTh, -sTh * cAl, sTh * sAl, a * cTh,
        sTh, cTh * cAl, -cTh * sAl, a * sTh,
        0, sAl, cAl, d,
        0, 0, 0, 1
    );
};

// --- Axis-Angle Utilities ---

export const getAxisAngleFromMatrix = (matrix: Matrix4) => {
    const q = new Quaternion().setFromRotationMatrix(matrix);
    // Clamp w to [-1, 1]
    const w = Math.min(Math.max(q.w, -1), 1);
    const angle = 2 * Math.acos(w);
    const s = Math.sqrt(1 - w * w);

    let axis = new Vector3(0, 0, 1);
    if (s > 0.001) {
        axis.set(q.x, q.y, q.z).divideScalar(s);
    }

    return { axis, angle };
};

export const getMatrixFromAxisAngle = (axis: Vector3, angle: number): Matrix4 => {
    const normAxis = axis.clone().normalize();
    return new Matrix4().makeRotationAxis(normAxis, angle);
};

// --- Screw Theory Utilities ---

export interface ScrewParameters {
    theta: number;    // Rotation angle (rad)
    d: number;        // Translation along axis
    s: Vector3;       // Axis direction (normalized)
    c: Vector3;       // Point on axis
}

export const getScrewParametersFromMatrix = (matrix: Matrix4): ScrewParameters => {
    const { axis: s, angle: theta } = getAxisAngleFromMatrix(matrix);
    const p = new Vector3().setFromMatrixPosition(matrix);

    // Case 1: Pure Translation (theta approx 0)
    if (Math.abs(theta) < 0.0001) {
        const d = p.length();
        const axis = d > 0.0001 ? p.clone().normalize() : new Vector3(0, 0, 1);
        // Axis passes through origin for pure translation in this context? 
        // Actually for pure translation, the screw pitch is infinite. 
        // But usually we model it as rotation 0, translation d along direction s.
        return { theta: 0, d, s: axis, c: new Vector3(0, 0, 0) };
    }

    // Case 2: General Screw
    // d = p . s
    const d = p.dot(s);

    // C = 0.5 * (p - d*s) + 0.5 * cot(theta/2) * (s x p)
    // cot(theta/2) = 1 / tan(theta/2)
    const term1 = p.clone().sub(s.clone().multiplyScalar(d)).multiplyScalar(0.5);
    const term2 = s.clone().cross(p).multiplyScalar(0.5 / Math.tan(theta / 2));
    const c = term1.add(term2);

    return { theta, d, s, c };
};

export const getMatrixFromScrewParameters = (params: ScrewParameters): Matrix4 => {
    const { theta, d, s, c } = params;
    const normS = s.clone().normalize();

    // Rotation R = exp([s]theta)
    const R = new Matrix4().makeRotationAxis(normS, theta);

    // Translation p = (I - R)C + d*s
    const I = new Matrix4(); // Identity
    // (I - R)
    const I_minus_R = new Matrix4();
    for (let i = 0; i < 16; i++) I_minus_R.elements[i] = I.elements[i] - R.elements[i];
    // We need to be careful with Matrix4 operations which are 4x4. 
    // Easier to do vector math: p = C - R*C + d*s

    const RC = c.clone().applyMatrix4(R);
    const p = c.clone().sub(RC).add(normS.clone().multiplyScalar(d));

    const T = R.clone();
    T.setPosition(p);

    return T;
};
