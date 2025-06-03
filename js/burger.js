const burger = document.getElementById('burger-btn');
const mobileNav = document.getElementById('mobileNav');

if (burger && mobileNav) {
  burger.addEventListener('click', (e) => {
    e.stopPropagation();
    burger.classList.add('glow');
    setTimeout(() => burger.classList.remove('glow'), 1000);
    mobileNav.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!mobileNav.contains(e.target) && e.target !== burger) {
      mobileNav.classList.remove('open');
    }
  });
}
