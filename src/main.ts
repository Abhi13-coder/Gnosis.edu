import './style.css';
import { initScene } from './scene/sceneManager';
import { setupSceneScrollTriggers } from './motion/scrollCamera';
import { setupReveals, setupSectionRail } from './motion/reveal';
import { setupTilt } from './motion/tilt';
import { setupSmoothScroll } from './motion/smoothScroll';
import { setupQuestDemo } from './ui/questDemo';
import { setupBoot } from './ui/boot';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.matchMedia('(max-width:760px)').matches;

setupBoot(reduceMotion);
setupSmoothScroll(reduceMotion);
setupReveals(reduceMotion);
setupSectionRail();
setupTilt(reduceMotion, isMobile);
setupQuestDemo();

const canvas = document.getElementById('webgl') as HTMLCanvasElement | null;

try {
  if (!canvas) throw new Error('canvas #webgl not found');
  const handles = initScene(canvas, { isMobile, reduceMotion });
  setupSceneScrollTriggers(handles);
} catch (e) {
  console.warn('WebGL scene failed to initialize — falling back to CSS background', e);
  document.body.classList.add('no-webgl');
  if (canvas) canvas.style.display = 'none';
}
