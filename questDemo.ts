export function setupQuestDemo(): void {
  const choices = document.querySelectorAll<HTMLElement>('#choices .choice');
  const result = document.getElementById('demoResult');
  if (!choices.length || !result) return;

  choices.forEach((c) => {
    c.addEventListener('click', () => {
      choices.forEach((x) => (x.style.pointerEvents = 'none'));
      const correct = document.querySelector<HTMLElement>('#choices .correct');
      if (correct) {
        correct.style.borderColor = 'var(--gold-soft)';
        correct.style.background = 'rgba(205,163,85,.14)';
        correct.style.boxShadow = '0 0 22px -6px rgba(205,163,85,.6)';
      }
      if (!c.classList.contains('correct')) c.style.opacity = '.4';
      result.classList.add('show');
      setTimeout(() => choices.forEach((x) => (x.style.pointerEvents = 'auto')), 1400);
    });
  });
}
