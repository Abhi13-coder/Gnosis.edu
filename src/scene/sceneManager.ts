import * as THREE from 'three';
import { createStarfield } from './starfield';
import { createHeadset, createNeuralParticles, type NeuralParticles } from '../objects/headset';

export interface SceneHandles {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  headsetGroup: THREE.Group;
  igniteHeadset: (on: boolean) => void;
  dispose: () => void;
}

/**
 * Initializes the whole WebGL layer. Throws on failure so the caller can
 * fall back to a plain CSS background — this scene is an enhancement,
 * never a requirement for the page to be usable.
 */
export function initScene(canvas: HTMLCanvasElement, opts: { isMobile: boolean; reduceMotion: boolean }): SceneHandles {
  const { isMobile, reduceMotion } = opts;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setClearColor(0x060810, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 7);

  const stars = createStarfield(isMobile);
  scene.add(stars);

  scene.add(new THREE.AmbientLight(0x223055, 1.1));
  const blueLight = new THREE.PointLight(0x4f8dff, 6, 12);
  blueLight.position.set(1.4, 1.2, 2.4);
  const goldLight = new THREE.PointLight(0xcda355, 3.2, 12);
  goldLight.position.set(-1.6, -1, 2);
  scene.add(blueLight, goldLight);

  const { group: headsetGroup, nodePositions } = createHeadset();
  scene.add(headsetGroup);

  const neural: NeuralParticles = createNeuralParticles(nodePositions, isMobile);
  scene.add(neural.points);

  // ---- Drag-to-rotate interaction state ----
  let headsetActive = false;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let rotY = 0;
  let rotX = 0;
  let autoSpin = 0;

  const start = (x: number, y: number) => {
    if (!headsetActive) return;
    dragging = true;
    lastX = x;
    lastY = y;
  };
  const move = (x: number, y: number) => {
    if (!dragging) return;
    const dx = x - lastX;
    const dy = y - lastY;
    rotY += dx * 0.006;
    rotX += dy * 0.004;
    rotX = Math.max(-0.5, Math.min(0.5, rotX));
    lastX = x;
    lastY = y;
  };
  const end = () => {
    dragging = false;
  };

  const onPointerDown = (e: PointerEvent) => start(e.clientX, e.clientY);
  const onPointerMove = (e: PointerEvent) => move(e.clientX, e.clientY);
  const onPointerUp = () => end();
  const onTouchStart = (e: TouchEvent) => { const t = e.touches[0]; if (t) start(t.clientX, t.clientY); };
  const onTouchMove = (e: TouchEvent) => { const t = e.touches[0]; if (t) move(t.clientX, t.clientY); };
  const onTouchEnd = () => end();

  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('touchstart', onTouchStart, { passive: true });
  canvas.addEventListener('touchmove', onTouchMove, { passive: true });
  canvas.addEventListener('touchend', onTouchEnd);

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', onResize);

  function igniteHeadset(on: boolean) {
    headsetActive = on;
  }

  const clock = new THREE.Clock();
  let rafId = 0;

  function animate() {
    rafId = requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    if (!reduceMotion) stars.rotation.y += dt * 0.01;

    if (headsetGroup.visible) {
      if (!dragging) autoSpin += dt * 0.15;
      headsetGroup.rotation.y = rotY + autoSpin * 0.3;
      headsetGroup.rotation.x = rotX;
      headsetGroup.position.y = Math.sin(t * 0.6) * 0.06;
    }

    const neuralMat = neural.points.material as THREE.PointsMaterial;
    if (neuralMat.opacity > 0.01) {
      const pos = neural.points.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < neural.seeds.length; i++) {
        pos.array[i * 3] = neural.basePositions[i * 3] + Math.sin(t * 1.4 + neural.seeds[i]) * 0.12;
        pos.array[i * 3 + 1] = neural.basePositions[i * 3 + 1] + Math.cos(t * 1.1 + neural.seeds[i]) * 0.12;
        pos.array[i * 3 + 2] = neural.basePositions[i * 3 + 2] + Math.sin(t * 0.9 + neural.seeds[i]) * 0.12;
      }
      pos.needsUpdate = true;
    }

    blueLight.intensity = 5 + Math.sin(t * 1.3) * 1.4;

    renderer.render(scene, camera);
  }
  animate();

  // expose the neural particle system + headset group for external ignite tweening (GSAP lives outside three.js)
  (headsetGroup as any).__neuralPoints = neural.points;

  function dispose() {
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('touchstart', onTouchStart);
    canvas.removeEventListener('touchmove', onTouchMove);
    canvas.removeEventListener('touchend', onTouchEnd);
    renderer.dispose();
  }

  return { scene, camera, renderer, headsetGroup, igniteHeadset, dispose };
}
