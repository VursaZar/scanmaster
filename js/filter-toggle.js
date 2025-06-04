document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('filterToggle');
  const filters = document.querySelector('.filters');
  if (!toggleBtn || !filters) return;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    filters.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!filters.contains(e.target) && e.target !== toggleBtn) {
      filters.classList.remove('open');
    }
  });
});
