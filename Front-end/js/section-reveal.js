document.addEventListener('DOMContentLoaded', function(){
  const sections = document.querySelectorAll('main section');
  if(!('IntersectionObserver' in window)){
    // fallback: reveal all
    sections.forEach(s=> s.classList.add('in-view'));
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  sections.forEach(s => {
    s.classList.add('section-transition');
    observer.observe(s);
  });
});
