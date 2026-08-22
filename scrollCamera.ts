import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { SceneHandles } from '../scene/sceneManager';

gsap.registerPlugin(ScrollTrigger);

/**
 * Ties the WebGL camera to the page's scroll position (Type A: cinematic
 * camera travel) and activates the interactive headset while the Core MVP
 * section is in view (Type B: the product the visitor gets to touch).
 */
export function setupSceneScrollTriggers(handles: SceneHandles): void {
  const { camera, headsetGroup, igniteHeadset } = handles;
  const neuralPoints = (headsetGroup as any).__neuralPoints as THREE.Points | undefined;

  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1,
    onUpdate: (self) => {
      const p = self.progress;
      camera.position.z = 7 - Math.sin(p * Math.PI) * 2.2;
      camera.position.x = Math.sin(p * Math.PI * 2) * 0.4;
    }
  });

  const mvpSection = document.getElementById('mvp');
  if (!mvpSection) return;

  let active = false;

  const toggle = (on: boolean) => {
    active = on;
    igniteHeadset(on);
    headsetGroup.visible = true;
    gsap.to(headsetGroup.scale, {
      x: on ? 1 : 0.001,
      y: on ? 1 : 0.001,
      z: on ? 1 : 0.001,
      duration: 1.1,
      ease: 'back.out(1.4)'
    });
    if (neuralPoints) {
      gsap.to(neuralPoints.material, { opacity: on ? 0.85 : 0, duration: 1 });
    }
    if (!on) {
      setTimeout(() => {
        if (!active) headsetGroup.visible = false;
      }, 1200);
    }
  };

  ScrollTrigger.create({
    trigger: mvpSection,
    start: 'top 60%',
    end: 'bottom 40%',
    onEnter: () => toggle(true),
    onEnterBack: () => toggle(true),
    onLeave: () => toggle(false),
    onLeaveBack: () => toggle(false)
  });
}
