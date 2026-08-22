import * as THREE from 'three';

export interface HeadsetBuild {
  group: THREE.Group;
  nodePositions: THREE.Vector3[];
}

/**
 * Builds a stylized, GNOSIS-branded EEG headset from primitive geometry —
 * a headband arc, two ear cups, and a ring of glowing sensor nodes.
 * No external 3D model is required; this is intentionally procedural so
 * it stays lightweight on mobile and never needs an asset pipeline.
 */
export function createHeadset(): HeadsetBuild {
  const group = new THREE.Group();
  group.visible = false;
  group.scale.setScalar(0.001);

  const bandMat = new THREE.MeshStandardMaterial({
    color: 0x0d1226,
    metalness: 0.55,
    roughness: 0.35,
    emissive: 0x0a1430,
    emissiveIntensity: 0.4
  });
  const band = new THREE.Mesh(
    new THREE.TorusGeometry(1.35, 0.09, 24, 64, Math.PI * 1.05),
    bandMat
  );
  band.rotation.z = Math.PI * 0.5 + Math.PI * 0.025;
  band.rotation.x = Math.PI * 0.02;
  group.add(band);

  const cupMat = new THREE.MeshStandardMaterial({ color: 0x141b33, metalness: 0.5, roughness: 0.4 });
  const cupGeo = new THREE.SphereGeometry(0.42, 24, 24);
  const cupL = new THREE.Mesh(cupGeo, cupMat);
  cupL.position.set(-1.28, -0.42, 0);
  cupL.scale.set(0.7, 1, 1);
  const cupR = new THREE.Mesh(cupGeo, cupMat);
  cupR.position.set(1.28, -0.42, 0);
  cupR.scale.set(0.7, 1, 1);
  group.add(cupL, cupR);

  const nodeMat = new THREE.MeshBasicMaterial({ color: 0x6fa3ff });
  const goldNodeMat = new THREE.MeshBasicMaterial({ color: 0xe6c88a });
  const nodePositions: THREE.Vector3[] = [];
  const nodeCount = 9;

  for (let i = 0; i < nodeCount; i++) {
    const t = i / (nodeCount - 1);
    const ang = Math.PI * 0.02 + t * Math.PI * 1.0;
    const x = Math.cos(ang) * 1.35;
    const y = Math.sin(ang) * 1.35 - 0.1;
    const node = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), i % 3 === 0 ? goldNodeMat : nodeMat);
    node.position.set(x * 0.98, y * 0.98, 0.15);
    group.add(node);
    nodePositions.push(node.position.clone());
  }

  return { group, nodePositions };
}

export interface NeuralParticles {
  points: THREE.Points;
  basePositions: Float32Array;
  seeds: Float32Array;
}

/**
 * A small particle burst seeded at each sensor node. Stays invisible
 * (opacity 0) until the Core MVP section activates it via GSAP.
 */
export function createNeuralParticles(nodePositions: THREE.Vector3[], isMobile: boolean): NeuralParticles {
  const particleCount = isMobile ? 220 : 520;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const seeds = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const src = nodePositions[i % nodePositions.length];
    positions[i * 3] = src.x + (Math.random() - 0.5) * 0.1;
    positions[i * 3 + 1] = src.y + (Math.random() - 0.5) * 0.1;
    positions[i * 3 + 2] = src.z + (Math.random() - 0.5) * 0.1;
    seeds[i] = Math.random() * Math.PI * 2;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0x9fc3ff,
    size: 0.035,
    transparent: true,
    opacity: 0,
    depthWrite: false
  });

  const points = new THREE.Points(geometry, material);
  return { points, basePositions: positions.slice(), seeds };
}
