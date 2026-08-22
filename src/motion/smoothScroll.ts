import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export function setupSmoothScroll(reduceMotion: boolean): Lenis | null {
  if (reduceMotion) return null;

  try {
    const lenis = new Lenis({ smoothWheel: true, duration: 1.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    return lenis;
  } catch (e) {
    console.warn('Lenis unavailable, falling back to native scroll', e);
    return null;
  }
}
