export function setupBoot(reduceMotion: boolean): void {
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('boot')?.classList.add('hide');
      document.body.classList.remove('boot-lock');
    }, reduceMotion ? 200 : 2200);
  });
}
