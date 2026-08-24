(() => {
  'use strict';

  const controls = Array.from(document.querySelectorAll('[data-skill-filter]'));
  const cards = Array.from(document.querySelectorAll('[data-skill-category]'));

  if (!controls.length || !cards.length) return;

  function updateSkillFilter(category) {
    controls.forEach((control) => {
      const active = control.dataset.skillFilter === category;
      control.classList.toggle('is-active', active);
      control.setAttribute('aria-pressed', String(active));
    });

    cards.forEach((card) => {
      const visible = category === 'all' || card.dataset.skillCategory === category;
      card.hidden = !visible;
    });

    const url = new URL(window.location.href);
    if (category === 'all') {
      url.searchParams.delete('skill-category');
    } else {
      url.searchParams.set('skill-category', category);
    }
    window.history.replaceState({}, '', url);
  }

  controls.forEach((control) => {
    control.setAttribute('aria-pressed', String(control.classList.contains('is-active')));
    control.addEventListener('click', () => updateSkillFilter(control.dataset.skillFilter || 'all'));
  });

  const requestedCategory = new URLSearchParams(window.location.search).get('skill-category');
  if (requestedCategory && controls.some((control) => control.dataset.skillFilter === requestedCategory)) {
    updateSkillFilter(requestedCategory);
  }
})();
