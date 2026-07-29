(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const config = PORTFOLIO_CONFIG;
  const projects = PORTFOLIO_PROJECTS;
  const allImages = projects.flatMap(project => project.images.map(image => ({...image, project: project.name, slug: project.slug})));

  document.title = `${config.name} — ${config.role}`;
  $('#brand-name').textContent = config.name.toUpperCase();
  $('#hero-eyebrow').textContent = config.eyebrow;
  $('#hero-intro').textContent = config.intro;
  $('#footer-message').textContent = config.footer;
  $('#stat-projects').textContent = String(projects.length).padStart(2,'0');
  $('#stat-works').textContent = String(allImages.length).padStart(2,'0');
  $('#current-year').textContent = new Date().getFullYear();

  const projectList = $('#project-list');
  const preview = document.createElement('div');
  preview.className = 'project-preview';
  preview.innerHTML = '<img alt="معاينة المشروع">';
  document.body.appendChild(preview);

  projects.forEach((project, i) => {
    const row = document.createElement('article');
    row.className = 'project-row reveal';
    row.dataset.slug = project.slug;
    row.innerHTML = `
      <span class="number">${String(i+1).padStart(2,'0')}</span>
      <h3>${project.name}</h3>
      <div class="project-meta"><span>${project.type}</span><span>${project.images.length} عمل مختار · ${project.year}</span></div>
      <span class="project-arrow">↖</span>`;
    row.addEventListener('click', () => setFilter(project.slug, true));
    row.addEventListener('mouseenter', () => { preview.querySelector('img').src = project.cover; preview.classList.add('visible'); });
    row.addEventListener('mouseleave', () => preview.classList.remove('visible'));
    row.addEventListener('mousemove', e => { preview.style.left = `${e.clientX}px`; preview.style.top = `${e.clientY}px`; });
    projectList.appendChild(row);
  });

  const filters = $('#filters');
  [{slug:'all',name:'كل الأعمال'}, ...projects.map(p => ({slug:p.slug,name:p.name}))].forEach((item,i) => {
    const button = document.createElement('button');
    button.className = `filter-button${i===0?' active':''}`;
    button.textContent = item.name;
    button.dataset.filter = item.slug;
    button.addEventListener('click', () => setFilter(item.slug));
    filters.appendChild(button);
  });

  const gallery = $('#gallery');
  allImages.forEach((item, index) => {
    const figure = document.createElement('figure');
    figure.className = 'gallery-item';
    figure.dataset.project = item.slug;
    figure.dataset.index = index;
    figure.innerHTML = `<img src="${item.src}" alt="${item.title} — ${item.project}" loading="lazy" width="${item.width}" height="${item.height}">
      <figcaption class="gallery-caption"><strong>${item.title}</strong><span>${item.project}</span></figcaption>`;
    figure.addEventListener('click', () => openLightbox(index));
    gallery.appendChild(figure);
  });

  function setFilter(slug, scroll=false) {
    $$('.filter-button').forEach(b => b.classList.toggle('active', b.dataset.filter === slug));
    let count=0;
    $$('.gallery-item').forEach(item => {
      const show = slug === 'all' || item.dataset.project === slug;
      item.hidden = !show;
      if(show) count++;
    });
    $('#visible-count').textContent = `يتم عرض ${String(count).padStart(2,'0')} عمل`;
    if(scroll) $('#work').scrollIntoView({behavior:'smooth'});
  }
  setFilter('all');

  const links = $('#contact-links');
  const contactOptions = [
    ['البريد الإلكتروني', config.email ? `mailto:${config.email}` : ''],
    ['إنستغرام', config.instagram],
    ['بيهانس', config.behance]
  ].filter(([,href]) => href);
  if(contactOptions.length) contactOptions.forEach(([label,href]) => {
    const a=document.createElement('a'); a.href=href; a.textContent=label; if(!href.startsWith('mailto:')) {a.target='_blank';a.rel='noreferrer';} links.appendChild(a);
  });
  else links.hidden = true;

  const lightbox = $('.lightbox');
  const lightboxImg = $('.lightbox img');
  let currentIndex = 0;
  function openLightbox(index) { currentIndex=index; updateLightbox(); lightbox.classList.add('open'); lightbox.setAttribute('aria-hidden','false'); document.body.classList.add('lightbox-open'); }
  function closeLightbox() { lightbox.classList.remove('open'); lightbox.setAttribute('aria-hidden','true'); document.body.classList.remove('lightbox-open'); }
  function updateLightbox() { const item=allImages[currentIndex]; lightboxImg.src=item.src; lightboxImg.alt=`${item.title} — ${item.project}`; $('.lightbox-title').textContent=`${item.project} / ${item.title}`; $('.lightbox-count').textContent=`${String(currentIndex+1).padStart(2,'0')} / ${String(allImages.length).padStart(2,'0')}`; }
  function moveLightbox(dir) { currentIndex=(currentIndex+dir+allImages.length)%allImages.length; updateLightbox(); }
  $('.lightbox-close').addEventListener('click',closeLightbox); $('.lightbox-prev').addEventListener('click',()=>moveLightbox(-1)); $('.lightbox-next').addEventListener('click',()=>moveLightbox(1));
  lightbox.addEventListener('click',e=>{ if(e.target===lightbox) closeLightbox(); });
  document.addEventListener('keydown',e=>{ if(!lightbox.classList.contains('open')) return; if(e.key==='Escape') closeLightbox(); if(e.key==='ArrowLeft') moveLightbox(1); if(e.key==='ArrowRight') moveLightbox(-1); });

  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting) entry.target.classList.add('in-view'); }), {threshold:.08, rootMargin:'0px 0px -35px'});
  $$('.reveal,.gallery-item').forEach(el=>observer.observe(el));

  const toggle=$('.menu-toggle'), mobileMenu=$('.mobile-menu');
  toggle.addEventListener('click',()=>{ const open=document.body.classList.toggle('menu-open'); toggle.setAttribute('aria-expanded',String(open)); mobileMenu.setAttribute('aria-hidden',String(!open)); toggle.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة'); });
  $$('.mobile-menu a').forEach(a=>a.addEventListener('click',()=>{ document.body.classList.remove('menu-open'); toggle.setAttribute('aria-expanded','false'); mobileMenu.setAttribute('aria-hidden','true'); toggle.setAttribute('aria-label','فتح القائمة'); }));

  const progress=$('.scroll-progress span');
  const siteHeader=$('.site-header');
  const updateOnScroll=()=>{
    const max=document.documentElement.scrollHeight-innerHeight;
    progress.style.width=`${max>0?(scrollY/max)*100:0}%`;
    const scrolled = window.scrollY > 6;
    siteHeader.classList.toggle('is-scrolled', scrolled);
    document.body.classList.toggle('header-scrolled', scrolled);
  };
  addEventListener('scroll', updateOnScroll, {passive:true});
  addEventListener('load', updateOnScroll);
  addEventListener('pageshow', updateOnScroll);
  updateOnScroll();
})();
