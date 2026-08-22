import * as THREE from 'three';

/**
 * Creates the persistent celestial starfield that sits behind the entire
 * scroll journey. Two-tone (white / gold) points, distributed on a sphere
 * shell so rotation reads naturally from any camera position.
 */
export function createStarfield(isMobile: boolean): THREE.Points {
  const starCount = isMobile ? 700 : 1800;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);

  const gold = new THREE.Color(0xcda355);
  const white = new THREE.Color(0xe9e6f2);

  for (let i = 0; i < starCount; i++) {
    const r = 18 + Math.random() * 28;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi) - 10;

    const c = Math.random() > 0.86 ? gold : white;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true
  });

  const points = new THREE.Points(geometry, material);
  points.name = 'starfield';
  return points;
}
