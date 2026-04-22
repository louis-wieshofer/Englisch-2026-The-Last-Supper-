export const initSolutions = (): void => {
  const cards = document.querySelectorAll<HTMLElement>('.flip-card');
  cards.forEach((card) => {
    const toggle = (): void => { card.classList.toggle('flipped'); };
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-pressed', 'false');
  });
};
