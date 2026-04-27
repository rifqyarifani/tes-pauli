
(function(){
  const toggle = document.querySelector('[data-mobile-toggle]');
  const links = document.querySelector('[data-nav-links]');
  if(toggle && links){
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }
  document.querySelectorAll('[data-current-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
  document.querySelectorAll('[data-faq-question]').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.querySelectorAll('[data-demo-answer]').forEach(el => {
    el.addEventListener('click', () => {
      el.textContent = (Number(el.dataset.demoAnswer) || 0).toString();
      el.classList.add('input-demo');
    });
  });
})();
