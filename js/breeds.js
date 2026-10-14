/* ============================================================
   BREEDS PAGE — FILTER
   ============================================================ */
(function(){
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {

    const chips = document.querySelectorAll('.filter-chip');
    const cards = document.querySelectorAll('.breed-card');

    if (!chips.length || !cards.length) return;

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const filter = chip.dataset.filter;

        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        cards.forEach(card => {
          const group = card.dataset.group;
          const show = filter === 'all' || group === filter;
          card.classList.toggle('is-hidden', !show);
        });
      });
    });

  });
})();