import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function setupReveals(reduceMotion: boolean): void {
  document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
    const type = el.dataset.r || 'fade-up';
    const from = type === 'fade-scale' ? { opacity: 0, scale: 0.92, y: 20 } : { opacity: 0, y: 36 };
    const to = type === 'fade-scale' ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, y: 0 };

    gsap.fromTo(el, from, {
      ...to,
      duration: reduceMotion ? 0.01 : 1.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' }
    });
  });
}

export function setupSectionRail(): void {
  const sections = document.querySelectorAll<HTMLElement>('main > section');
  const rail = document.getElementById('rail');
  if (!rail) return;

  sections.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.dataset.i = String(i);
    rail.appendChild(dot);
  });
  const dots = rail.querySelectorAll<HTMLSpanElement>('span');

  sections.forEach((section, i) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onToggle: (self) => {
        if (self.isActive) {
          dots.forEach((d) => d.classList.remove('active'));
          dots[i]?.classList.add('active');
        }
      }
    });
  });
}
